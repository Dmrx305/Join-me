import { useState, useEffect } from "react";
import axios from "axios";
import api from "./Axios";
import { useNavigate } from "react-router-dom";


export default function ProfileForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [socialType, setSocialType] = useState("extrovert");
  const [photo, setPhoto] = useState(null);
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

  const handleDeletePhoto = async () => {
  try {
    await axios.delete("http://localhost:5000/api/delete_profile_photo", {
      withCredentials: true,
    });
    setPhoto(null);
    setMessage("Profile photo deleted!");    
  } catch (err) {
    console.error(err);
    setMessage("Failed to delete photo!");
  }
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
      await api.post("/create_or_update_profile", formData);
      setMessage("Profile saved!");
      setTimeout(() => navigate("/show_my_profile"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile!");
    }
  };

  return (      
      <div className="flex justify-center items-center">
      <div className="max-w-md rounded-xl bg-white shadow-md p-5">
        <p 
        className="text-4xl text-center p-5 mb-5 justify-center font-anotherhand tracking-wide [text-shadow:2px_4px_4px_rgba(0,0,0,0.1)]" > 
        Create / Edit Profile 
        </p>

      <form 
      onSubmit={handleSubmit}
      className="flex justify-center items-center flex-col space-y-4" 
      >
        
          <input 
          className="max-w-md h-[30px] text-center bg-white rounded-md  drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          />

          <input 
          className="max-w-md h-[30px] text-center bg-white rounded-md drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
          placeholder="Age"
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
          />
   
          <input 
          className="max-w-md h-[30px] text-center bg-white rounded-md   drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
          placeholder="City"
          value={city}
          onChange={e => setCity(e.target.value)}
          />


        <div>
          <select className="text-center w-full h-[35px] bg-white rounded-md  drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            value={socialType}
            onChange={e => setSocialType(e.target.value)}>
            <option value="extrovert">Extrovert</option>
            <option value="introvert">Introvert</option>
          </select>
        </div>

        <div >
          <label 
          className="x-4 py-2 rounded bg-white drop-shadow-md w-[120px] h-[30px] cursor-pointer hover:scale-110 flex justify-center items-center">
          Upload Photo
          <input 
          type="file" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
          </label>

          <button
            type="button"
            onClick={handleDeletePhoto}
            className="mt-2 w-[120px] h-[30px] bg-white rounded hover:scale-110 drop-shadow-md hover:bg-red-400 hover:text-white transition"
          >
            Delete Photo
          </button>
        </div>

        {/* Interests */}
        <div>
          <p className="text-xl font-medium mb-4 text-center">
            Select Interests
          </p>

          <div className="grid grid-cols-2 gap-3">
          {interests.map(i => (
            <label 
            className="flex gap-1 hover:scale-110 hover:bg-[#FFCA7B] transition cursor-pointer justify-center bg-white rounded-md drop-shadow-md py-1 px-2" 
            key={i.id}
            >
              <input className="flex"
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
        className="w-[100px] h-[30px] flex justify-center items-center bg-white rounded-md font-medium hover:scale-110 hover:bg-green-400 hover:text-white transition drop-shadow-md" type="submit">
          Save
        </button>
      </form>
      <span className="flex justify-center mt-1 text-xl">
      {message && <h1 className="text-green-600 text-md font-medium rounded-md drop-shadow-md mt-2">{message}</h1>}
      </span>
      </div>
      </div>
  );
}
