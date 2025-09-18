import { useState } from "react";
import axios from "axios";
import "./App.css"; 

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.access_token) {
        setToken(res.data.access_token);
        alert("Login successful!");
      } else {
        alert("Login failed!");
      }
    } catch (err) {
      alert("Login failed!");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="forms">
      <h1>Join me!</h1>
      <h2>
        The App where <span className="highlight">YOU</span> can join{" "}
        <span className="highlight">ME</span>!
      </h2>

      <form onSubmit={handleLogin}>
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
          Login
        </button>
      </form>
    </div>
  );
}
