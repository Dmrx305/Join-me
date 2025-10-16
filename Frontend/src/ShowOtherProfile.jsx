import { useState, useEffect } from "react";
import axios from "axios";
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

  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="flex justify-center text-xl">  
            
      <div className="flex justify-center flex-col items-center">

      <section className="flex items-center mb-5">
      <div className="flex flex-col items-center">
      <p>Hi my name is {profileData.name}</p>
      <p>And I am {profileData.age} years old.</p>
      <p>I live near {profileData.city}</p>
      <p>and I am {profileData.social_type}.</p>
      </div>
      

      
      {profileData.photo && (
        <div className="flex m-2">
        <img className="border-none w-[100px] h-[120px] rounded shadow-md"
          src={`http://localhost:5000${profileData.photo}`}
          alt="Profile"
          />
      </div>
      )}
      </section>

           
      {profileData.interests && profileData.interests.length > 0 && (
        <p>I am interested in {profileData.interests.map(i => i.name).join(", ")}.</p>
      )}
      <p>Let my know, if I can join your activities!</p>
      <button  onClick={() => navigate(-1)} className="bg-white w-[100px] h-[25px] flex items-center justify-center rounded-sm mt-3 text-sm drop-shadow-md cursor-pointer hover:scale-110" to="/create_or_update_profile">Back</button>
      </div> 
      </div>
  );
}
