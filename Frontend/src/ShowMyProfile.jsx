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
    <div>
      {!profileData ? (
        <ProfileForm onProfileSaved={loadProfile} />
      ) : (

        <div className="flex justify-center flex-col items-center">
          <h1
            className="text-[#F28705] [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)] font-anotherhand text-7xl pt-10" >Join me!
          </h1>

          <h2 className="pt-5 text-3xl">Your Profile</h2>
         
          <section className="profileData">

            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Age:</strong> {profileData.age}</p>
            <p><strong>City:</strong> {profileData.city}</p>
            <p><strong>Social Type:</strong> {profileData.social_type}</p>
            {profileData.photo && (
              <img className="border-2 w-[50px] h-[70px]"
                src={`http://localhost:5000${profileData.photo}`}
                alt="Profile"
                />
            )}
            {profileData.interests && profileData.interests.length > 0 && (
              <p><strong>Interests:</strong> {profileData.interests.map(i => i.name).join(", ")}</p>
            )}

          </section>
          <LogoutButton/>
          <nav className="pt-2">
          <Link className="bg-white w-[100px] h-[25px] flex items-center justify-center rounded-sm  text-sm drop-shadow-md cursor-pointer" to="/create_or_update_profile">Update Profile</Link>
          </nav>

        </div>
      )}
    </div>
  );
}
