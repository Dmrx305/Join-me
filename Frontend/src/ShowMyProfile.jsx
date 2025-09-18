import { useState, useEffect } from "react";
import axios from "axios";
import ProfileForm from "./ProfileForm";
import "./ShowMyProfile.css"

export default function ShowMyProfile({ token }) {
  const [profileData, setProfileData] = useState(null);

  const loadProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/show_my_profile", {
        headers: { Authorization: `Bearer ${token}` },
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
        <ProfileForm token={token} onProfileSaved={loadProfile} />
      ) : (
        <div className="myProfile">
          <h2>Your Profile</h2>
          <section className="profileData">
          <p><strong>Name:</strong> {profileData.name}</p>
          <p><strong>Age:</strong> {profileData.age}</p>
          <p><strong>City:</strong> {profileData.city}</p>
          <p><strong>Social Type:</strong> {profileData.social_type}</p>
          {profileData.photo && (
            <img
              src={`http://localhost:5000${profileData.photo}`}
              alt="Profile"
              style={{ width: "150px", borderRadius: "10px" }}
            />
          )}
          {profileData.interests && profileData.interests.length > 0 && (
            <p><strong>Interests:</strong> {profileData.interests.map(i => i.name).join(", ")}</p>
          )}
          </section>
        </div>
      )}
    </div>
  );
}
