import { useState, useEffect } from "react";
import axios from "axios";


export default function ProfileForm() {
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
      .get("http://localhost:5000/api/interests", {withCredentials:true})
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
      await axios.post("http://localhost:5000/api/create_or_update_profile", formData,
         {
          withCredentials:true,
        }
      );
      setMessage("Profile saved!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile!");
    }
  };

  return (
<>      
      <p className="text-3xl" > Create/Edit Profile </p>

      <div className>
      <form className="flex justify-center items-center flex-col space-y-2" onSubmit={handleSubmit}>

        
          <input className="w-[200px] h-[30px] text-center bg-white rounded-sm drop-shadow-md"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />


          <input className="w-[200px] h-[30px] text-center bg-white rounded-sm drop-shadow-md"
            placeholder="Age"
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
          />


   
          <input className="w-[200px] h-[30px] text-center bg-white rounded-sm drop-shadow-md"
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

        </div>

        <div>
          <h1 className="text-xl">Select Interests</h1>

          {interests.map(i => (
            <label className="flex justify-center" key={i.id}>
              <input className="flex"
                type="checkbox"
                checked={selectedInterests.includes(i.id)}
                onChange={() => handleInterestChange(i.id)}
              />
              {i.name}
            </label>
          ))}
        </div>

        <button className="w-[100px] h-[30px] flex justify-center items-center bg-white rounded-sm hover:scale-110 drop-shadow-md" type="submit">Save</button>
      </form>
      </div>
      {message && <p>{message}</p>}
</>
  );
}
