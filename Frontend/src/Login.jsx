import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "./Axios";

export default function Login() {
  const {login} = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login",
        { username, password },
        {headers: { "Content-Type": "application/json" }}
      );

      if (res.status === 200) {

        login(res.data.access_token);
        navigate("/show_my_profile");
      } else {
        alert("Login failed!");
      }
    } catch (err) {
      alert("Login failed!");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div
      className="flex justify-center flex-col items-center">

      <h3
        className="text-[#F28705] [text-shadow:2px_4px_4px_rgba(0,0,0,0.2)] font-anotherhand text-6xl mb-5 pt-10" >
        Join me!
      </h3>

      <h2 className="text-xl mb-4">
        The App where
        <span className="text-[#F28705] [text-shadow:2px_4px_4px_rgba(0,0,0,0.2)] font-anotherhand text-3xl pl-1 pr-1"
        >YOU</span> can join {" "}
        <span className="text-[#F28705] [text-shadow:2px_4px_4px_rgba(0,0,0,0.2)] font-anotherhand text-3xl pl-1 pr-1"
        >ME</span>
      </h2>

      <form className="space-y-2 flex justify-center flex-col items-center" onSubmit={handleLogin}>

        <input className="w-[200px] h-[30px] flex justify-center text-center bg-white rounded-lg  drop-shadow-md focus:outline-none focus:ring-1 focus:ring-[#FFCA7B] transition"
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
          Login
        </button>

      </form>
    </div>
  );
}
