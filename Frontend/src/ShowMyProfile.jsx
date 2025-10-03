import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileForm from "./ProfileForm";
import { AuthContext } from "./AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function ShowMyProfile() {
  const {token} = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/show_my_profile", {
        headers: {Authorization: `Bearer ${token}`},
        withCredentials: true,
      });
      setProfileData(res.data);
    } catch {
      setProfileData(null);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);


  return (
    <>
      {!profileData ? (
        <ProfileForm onProfileSaved={loadProfile} />
      ) : (

        <div className="flex justify-center flex-col items-center">
          <p className="pb-5  text-3xl">Your Profile</p>
         
          <section className="flex flex-row">
            <div className="">

            <p>Name:{profileData.name}</p>
            <p>Age: {profileData.age}</p>
            <p>City: {profileData.city}</p>
            <p>Social Type: {profileData.social_type}</p>
             {profileData.interests && profileData.interests.length > 0 && (
              <p>Interests: {profileData.interests.map(i => i.name).join(", ")}</p>
            )}
            </div>

            {profileData.photo && (
              <div className="flex">
              <img className="border-2 w-[100px] h-[120px] rounded "
                src={`http://localhost:5000${profileData.photo}`}
                alt="Profile"
                />
            </div>
            )}
           

          </section>

          <Link className="bg-white w-[100px] h-[25px] flex items-center justify-center rounded-sm  text-sm drop-shadow-md cursor-pointer" to="/create_or_update_profile"
          >Update Profile</Link>

        </div>
      )}
</>
  );
}
