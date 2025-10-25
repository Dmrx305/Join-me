import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";
import DeleteProfile from "./DeleteProfile";

export default function ShowMyProfile() {
  const { user } = useContext(AuthContext);

  if (!user) return <p className="text-center text-xl">Loading profile...</p>;

  return (
    <div className="flex justify-center mt-5">
      <div className="bg-white shadow-md p-5 rounded-xl w-1/4 text-center">
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
        <p><strong>Interests:</strong> {user.interests.map(i => i.name).join(", ")}</p>

        <div className="flex justify-center gap-3 mt-4">
          <DeleteProfile />
          <Link className="bg-white drop-shadow-md p-1 text-sm rounded-sm hover:scale-105 hover:bg-[#FFCA7B] cursor-pointer transition" to="/create_or_update_profile">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
}
