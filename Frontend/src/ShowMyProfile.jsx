import { useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";
import DeleteProfile from "./DeleteProfile";
import { useNavigate } from "react-router-dom";

export default function ShowMyProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log(user)
  useEffect(() => {
    if (!user) {
      console.log(user)
      navigate("/create_or_update_profile")
    }
  }, [user]);

  console.log(user)
  if (!user) return <p className="text-center text-xl">Loading profile...</p>;

  return (
    <div className="flex justify-center mt-5">
      <div className="bg-white shadow-md p-5 rounded-xl md:w-1/4 text-center">
        <h2 className="text-2xl font-medium mb-4">Your Profile</h2>

        {user.photo ? (
          <img className="w-24 h-32 object-fill rounded-xl border-none mx-auto mb-3 shadow-md" src={user.photo} alt="Profile"/>
        ) : (
          <div className="w-24 h-32 bg-gray-500 flex items-center justify-center mx-auto mb-3">No Photo</div>
        )}

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>City:</strong> {user.city}</p>
        <p><strong>Social Type:</strong> {user.social_type}</p>
        <p>
          <strong>Interests:</strong>{" "}
          {Array.isArray(user.interests)
            ? user.interests.map(i => i.name).join(", ")
            : "No interests"}
        </p>

        <div className="flex justify-center gap-3 mt-4">
          <DeleteProfile />
          <Link className="bg-white drop-shadow-md p-1 text-sm rounded-sm hover:scale-105 hover:bg-[#FFCA7B] cursor-pointer transition" to="/create_or_update_profile">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
}
