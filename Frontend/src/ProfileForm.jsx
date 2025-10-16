import { useState, useEffect } from "react";
import axios from "axios";
import api from "./Axios";


export default function ProfileForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [socialType, setSocialType] = useState("extrovert");
  const [photo, setPhoto] = useState(null);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [message, setMessage] = useState("");

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
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile!");
    }
  };

  return (
<>      
      <p className="text-3xl flex mb-5 justify-center" > Create/Edit Profile </p>

      <div>
      <form className="flex justify-center items-center flex-col space-y-2" onSubmit={handleSubmit}>

        
          <input className="w-[200px] h-[30px] text-center bg-white rounded-sm drop-shadow-md focus-within:outline-[#F28705]"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />


          <input className="w-[200px] h-[30px] text-center bg-white rounded-sm drop-shadow-md focus-within:outline-[#F28705]"
            placeholder="Age"
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
          />


   
          <input className="w-[200px] h-[30px] text-center bg-white rounded-sm drop-shadow-md focus-within:outline-[#F28705]"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />


        <div 
        className="w-[100px] h-[30px] items-center  bg-white rounded-sm drop-shadow-md">
          <select
            value={socialType}
            onChange={e => setSocialType(e.target.value)}>
            <option value="extrovert">Extrovert</option>
            <option value="introvert">Introvert</option>
          </select>
        </div>

        <div >
          <label className="x-4 py-2 rounded bg-white drop-shadow-md w-[120px] h-[30px] cursor-pointer hover:scale-110 flex justify-center items-center">
            Upload Photo
          <input type="file" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
          </label>
          <button
            type="button"
            onClick={handleDeletePhoto}
            className="mt-2 w-[120px] h-[30px] bg-white rounded hover:scale-110 drop-shadow-md"
          >
            Delete Photo
          </button>
        </div>

        <div>
          <h1 className="text-xl">Select Interests</h1>

          {interests.map(i => (
            <label className="flex hover:scale-110 justify-center" key={i.id}>
              <input className="flex"
                type="checkbox"
                checked={selectedInterests.includes(i.id)}
                onChange={() => handleInterestChange(i.id)}
              />
              {i.name}
            </label>
          ))}
        </div>

        <button className="w-[100px] h-[30px] flex justify-center items-center bg-white rounded-sm hover:scale-110 drop-shadow-md" type="submit"
        >Save</button>
      </form>
      <span className="flex justify-center mt-1 text-xl">
      {message && <p>{message}</p>}
      </span>
      </div>
</>
  );
}
