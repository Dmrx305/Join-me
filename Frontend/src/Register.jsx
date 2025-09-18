import { useState } from "react";
import axios from "axios";
import "./App.css"; 

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
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(res.data.message || "Registration successful!");
      onRegisterSuccess(); // zurück zum Login
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="forms">
      <h1>Join me!</h1>
      <h2>
        The App where <span className="highlight">YOU</span> can join{" "}
        <span className="highlight">ME</span>!
      </h2>

      <form onSubmit={handleRegister}>
        <div className="username">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        </div>

        <div className="password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button className="loginbutton" type="submit">
          Register
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
