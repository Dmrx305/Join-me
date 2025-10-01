import { useState } from "react";
import axios from "axios";


export default function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/register",
        { username, password },
        { 
          headers: { "Content-Type": "application/json" },
        withCredentials: true }
      );

      setMessage(res.data.message || "Registration successful!");
      onRegisterSuccess(); // zurück zum Login
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div
      className="flex justify-center flex-col items-center">

      <h1
        className="text-[#F28705] [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)] font-anotherhand text-5xl pt-10" >Join me!
      </h1>

      <h2 className=" text-xl">
        The App where
        <span className="text-[#F28705] [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)] font-anotherhand text-3xl pl-1 pr-1"
        >YOU</span> can join {" "}
        <span className="text-[#F28705] [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)] font-anotherhand text-3xl pl-1 pr-1"
        >ME</span>!
      </h2>

      <form className="space-y-2 flex justify-center flex-col items-center" onSubmit={handleRegister}>
        
          <input className="w-[200px] h-[30px] flex justify-center text-center bg-white rounded-sm drop-shadow-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />



          <input className="w-[200px] h-[30px] flex justify-center text-center bg-white rounded-sm drop-shadow-md"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />


        <button className="bg-white w-[100px] h-[25px] flex items-center justify-center rounded-sm  drop-shadow-md cursor-pointer" type="submit">
          Register
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
