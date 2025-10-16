import { useState, useEffect, useContext } from "react";
import axios from "axios";
import ProfileForm from "./ProfileForm";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";
import api from "./Axios";
import DeleteProfile from "./DeleteProfile";

export default function ShowMyProfile() {
  const { token } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get("/show_my_profile", {
        headers: { Authorization: `Bearer ${token}`},
      });
      setProfileData(res.data);
    } catch {
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="flex justify-center">
      {loading ? (
        <p className="flex justify-center text-2xl">Loading Profile...</p>
      ) : !profileData ? (
        <ProfileForm onProfileSaved={loadProfile} />
      ) : (
        <div className="flex justify-center flex-col items-center divide-y divide-gray-400">
          <p className="pb-5 text-2xl">Your Profile</p>

          <section className="flex flex-row gap-6 mb-3">
            <div className="mb-4 mt-4">
              <p>Name: {profileData.name}</p>
              <p>Age: {profileData.age}</p>
              <p>City: {profileData.city}</p>
              <p>Social Type: {profileData.social_type}</p>
              {profileData.interests && profileData.interests.length > 0 && (
                <p>
                  Interests:{" "}
                  {profileData.interests.map((i) => i.name).join(", ")}
                </p>
              )}
            </div>

            {profileData.photo ? (
              <img
                className="border-1 w-[80px] h-[100px] rounded"
                src={`http://localhost:5000${profileData.photo}`}
                alt="Profile"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mt-5 drop-shadow-sm">
                <span>No Photo</span>
              </div>
            )}
          </section>
          <div className="flex gap-5 items-center ">
          <DeleteProfile/>
          <Link
            className="bg-white items-center rounded-sm p-1 text-sm drop-shadow-md hover:scale-110 cursor-pointer"
            to="/create_or_update_profile"
          >
            Update Profile
          </Link>
          </div>
        </div>
      )}
    </div>
  );
}
