import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile({ token }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState("");
    const [profileData, setProfileData] = useState(null);
    const [interests, setInterests] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);

    //interests laden
    useEffect(() => {
        axios.get("http://localhost:5000/api/interests")
            .then(res => setInterests(res.data))
            .catch((err) => console.error("Failed to load interests", err));
    }, []);

    // Profil Laden 
    useEffect(() => {
        axios.get("http://localhost:5000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                setProfileData(res.data);
                setName(res.data.name || "");
                setAge(res.data.age || "");
                setSelectedInterests(res.data.interests || []);
            })
            .catch(() => {
                setMessage("No profile yet!");
            });
    }, [token]);

    const handleInterestChange = (interestId) => {
        selectedInterests((prev) =>
            prev.includes(interestId)
                ? prev.filter((id) => id !== interestId)
                : [...prev, interestId]
        )
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("age", age);
        if (photo) {
            formData.append("photo", photo);
            selectedInterests.forEach((id => formData.append("interest_id", id)));
        }

        try {
            await axios.post("http://localhost:5000/api/profile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            // Nach Speichern erneut laden
            const res = await axios.get("http://localhost:5000/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfileData(res.data);
            setMessage("Profile saved!");
        } catch (err) {
            setMessage("Failed to save!");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("You really want to delete your profile?")) return;

        try {
            await axios.delete("http://localhost:5000/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfileData(null);
            setName("");
            setAge("");
            setPhoto(null);
            setMessage("Profile deleted!");
        } catch (err) {
            setMessage("Failed to delete!");
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
                <input type="file" onChange={e => setPhoto(e.target.files[0])} />

                <h3>Choose your interests</h3>
                {interests.map((interest) => (
                    <label key={interest.id} style={{ display: "block" }}>
                        <input
                            type="checkbox"
                            value={interest.id}
                            checked={selectedInterests.includes(interest.id)}
                            onChange={() => handleInterestChange(interest.id)}
                        />
                        {interest.name}
                    </label>
                ))}
                <button type="submit">Save</button>
            </form>


            {message && <p>{message}</p>}


            {profileData && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Current Profile</h3>
                    <p>
                        <strong>Name:</strong> {profileData.name}
                    </p>
                    <p>
                        <strong>Alter:</strong> {profileData.age}
                    </p>
                    {profileData.photo && (
                        <img
                            src={`http://localhost:5000${profileData.photo}`}
                            alt="Profile-picture"
                            style={{ width: "150px", borderRadius: "10px" }}
                        />
                    )}
                    {profileData.interests && profileData.interests.length > 0 && (
                        <div>
                            <strong>Interests:</strong>{""}
                            {profileData.interests.map((i) => i.name).join(",")}
                        </div>
                    )}
                    <div style={{ marginTop: "10px" }}>
                        <button
                            onClick={handleDelete}
                            style={{ background: "red", color: "white" }}>
                            Delete profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
