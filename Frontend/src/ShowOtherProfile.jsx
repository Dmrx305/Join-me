import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ShowOtherProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/show_other_profile/${userId}`, {
        withCredentials: true
      })
      .then(res => setProfileData(res.data))
      .catch(err => setError("Profile not found"));
  }, [userId, token]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!profileData) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>{profileData.name}'s Profile</h2>
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
    </div>
  );
}
