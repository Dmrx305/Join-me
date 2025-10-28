import { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "./Axios";
import { useNavigate } from "react-router-dom";
import UploadPhoto from "./UploadPhoto";


export default function ProfileForm() {
  const {user} = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age || "");
  const [city, setCity] = useState(user?.city || "");
  const [socialType, setSocialType] = useState(user?.socialType || "extrovert");
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  const loadInterests = async () => {
    const res = await api.get("/interests")
    setInterests(res.data)
  }
  useEffect(() =>{
    loadInterests();
  },[])


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
    selectedInterests.forEach(id => formData.append("interest_ids", id));

    try {
      const res = await api.post("/create_or_update_profile", formData);
      setMessage("Profile saved!");
      
      setTimeout(() => navigate(res.data.redirect || "/show_my_profile"), 300);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile!");      
    }
  };

  return (      
  <div className="flex justify-center items-center m-5">
    <div className="max-w-3xl rounded-xl bg-white shadow-md p-5">

      <p className="text-3xl text-center md:p-5 md:mb-5 font-anotherhand tracking-wide">
        Create / Edit Profile 
      </p>

      {/* 2-Spalten Layout */}
      <div className="flex flex-col md:flex-row gap-10">

        {/* LEFT: Upload */}
        <div className="flex justify-center md:justify-start">
          <UploadPhoto />
        </div>

        {/* RIGHT: FORM */}
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 flex-1"
        >
          <input className="h-[30px] text-center bg-white rounded-md drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input className="h-[30px] text-center bg-white rounded-md drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            placeholder="Age"
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
          />

          <input className="h-[30px] text-center bg-white rounded-md drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />

          <select className="text-center w-full h-[35px] bg-white rounded-md drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            value={socialType}
            onChange={e => setSocialType(e.target.value)}>
            <option value="extrovert">Extrovert</option>
            <option value="introvert">Introvert</option>
          </select>

          {/* Interests */}
          <div>
            <p className="text-xl font-medium mb-4 text-center">Select Interests</p>

            <div className="grid grid-cols-2 gap-3">
              {interests.map(i => (
                <label
                  className="flex gap-1 hover:scale-110 hover:bg-[#FFCA7B] transition cursor-pointer justify-center bg-white rounded-md drop-shadow-md py-1 px-2"
                  key={i.id}
                >
                  <input
                    type="checkbox"
                    checked={selectedInterests.includes(i.id)}
                    onChange={() => handleInterestChange(i.id)}
                  />
                  {i.name}
                </label>
              ))}
            </div>
          </div>

          <button
            className="w-[100px] h-[30px] mx-auto flex justify-center items-center bg-white rounded-md font-medium hover:scale-110 hover:bg-green-400 hover:text-white transition drop-shadow-md"
            type="submit">
            Save
          </button>

          {message && (
            <p className="text-center text-green-600 text-md font-medium rounded-md drop-shadow-md mt-2">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  </div>
);
}

