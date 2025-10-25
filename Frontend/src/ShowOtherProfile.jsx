import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./Axios";

export default function ShowOtherProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/show_other_profile/${userId}`)
      .then(res => setProfileData(res.data))
      .catch(err => setError("Profile not found"));
  }, [userId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!profileData) return <p className="flex justify-center text-2xl">Loading...</p>;

  return (
    <div className="flex justify-center text-lg">  
            
      <div className="flex justify-center flex-col items-center bg-white rounded-lg p-5 w-1/4 drop-shadow-md">

      <section className="flex flex-col items-center mb-5 ">

      {/* Profilbild */}
      {profileData.photo ? (
        <img className="w-24 h-32 object-fill rounded-xl border-none mx-auto mb-3 shadow-md"
          src={profileData.photo}
          alt="Profile"
          />
      ):(
        <div className="flex justify-center text-3xl text-gray-700 p-5 text-center items-center mb-5 bg-gray-200  w-[100px] h-[120px] rounded-xl shadow-md">
          {profileData.name.slice(0,1)}
        </div>
      )}

      {/* Profiltext */}
      <div className="flex flex-col items-center">
      <p>Hi my name is {profileData.name},</p>
      <p className="mb-5">and I am {profileData.age} years old.</p>
      <p>I live near {profileData.city}</p>
      <p>and I am {profileData.social_type}.</p>
      </div>
      </section>

      {/* Interessen */}
      <div className="flex flex-col text-center">
      {profileData.interests && profileData.interests.length > 0 && (
        <p>I am interested in:
          <span className="italic text-orange-500"> {profileData.interests.map(i => i.name).join(", ")}
            </span>
          </p>
      )}
      <p className="mt-4">Let my know, if I can join your activities!</p>
      </div>
      
      <button  onClick={() => navigate(-1)} className="bg-white w-[100px] h-[25px] flex  items-center justify-center rounded-sm mt-3 text-sm font-medium drop-shadow-md cursor-pointer hover:scale-110 hover:bg-[#FFCA7B] transition" to="/create_or_update_profile">
        ⬅️ Back
        </button>
      </div> 
      </div>
  );
}
