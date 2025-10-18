import { useState } from "react";
import axios from "axios";
import api from "./Axios";


export default function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/register",
        { username, password },
        { 
          headers: { "Content-Type": "application/json" }
        }
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

      <h3
        className="text-[#F28705] [text-shadow:2px_4px_4px_rgba(0,0,0,0.2)] font-anotherhand text-6xl mb-5 pt-10" >Join me!
      </h3>

      <h2 className=" text-xl mb-4">
        The App where
        <span className="text-[#F28705] [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)] font-anotherhand text-3xl pl-1 pr-1"
        >YOU</span> can join {" "}
        <span className="text-[#F28705] [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)] font-anotherhand text-3xl pl-1 pr-1"
        >ME</span>
      </h2>

      <form className="space-y-2 flex justify-center flex-col items-center"  onSubmit={handleRegister}>
        
          <input className="w-[200px] h-[30px] flex justify-center text-center bg-white rounded-lg  drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />



          <input className="w-[200px] h-[30px] flex justify-center text-center bg-white rounded-lg  drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />


        <button className="bg-[#F28705] text-white hover:scale-105 w-[100px] h-[25px] flex items-center justify-center rounded-lg drop-shadow-md cursor-pointer transition" type="submit">
          Register
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
