import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileForm({ token, onProfileSaved }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [socialType, setSocialType] = useState("extrovert");
  const [photo, setPhoto] = useState(null);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [message, setMessage] = useState("");

  // Interessen vom Backend laden
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/interests")
      .then(res => setInterests(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleInterestChange = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("city", city);
    formData.append("social_type", socialType);
    if (photo) formData.append("photo", photo);
    selectedInterests.forEach(id => formData.append("interest_ids", id));

    try {
      await axios.post("http://localhost:5000/api/create_or_update_profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setMessage("Profile saved!");
      onProfileSaved(); // Parent kann z.B. Profil neu laden
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile!");
    }
  };

  return (
    <div>
      <h2>Create/Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Age"
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
        />
        <input
          placeholder="City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />

        <select
          value={socialType}
          onChange={e => setSocialType(e.target.value)}
        >
          <option value="extrovert">Extrovert</option>
          <option value="introvert">Introvert</option>
        </select>

        <input type="file" onChange={e => setPhoto(e.target.files[0])} />

        <h3>Select Interests</h3>
        {interests.map(i => (
          <label key={i.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedInterests.includes(i.id)}
              onChange={() => handleInterestChange(i.id)}
            />
            {i.name}
          </label>
        ))}

        <button type="submit">Save Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
