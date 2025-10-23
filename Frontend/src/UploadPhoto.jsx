import { useContext, useState } from "react";
import api from "./Axios";
import { AuthContext } from "./AuthContext";

export default function UploadPhoto() {
  const { token, setUser, user } = useContext(AuthContext);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.photo || null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!photo) return setMessage("No photo selected!");

    const formData = new FormData();
    formData.append("image", photo);

    try {
      setLoading(true);
      const res = await api.post("/upload_photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`},
      });
      const newUrl = res.data.photo_url;

      setUser((prev) => ({ ...prev, photo: newUrl}));
      setPreview(newUrl);
      setMessage("✅ Upload successful!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md w-full max-w-sm mx-auto mt-10">
      {preview ? (
        <img src={preview} className="w-32 h-40 object-cover rounded-md mb-4" />
      ) : (
        <div className="w-32 h-40 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md mb-4">No Photo</div>
      )}

      <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-md mb-3">
        Choose File
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
