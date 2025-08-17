import { useState } from "react";
import axios from "axios";

export default function Register({ onRegisterSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/register", {
                username,
                password
            },
                { headers: { "Content-Type": "application/json" } }
            );
            setMessage(res.data.message);
            onRegisterSuccess();
        } catch (err) {
            setMessage(err.response?.data?.error || "Registration failed");
        }
    };
    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Register</button>
            <div style={{ marginTop: "1rem" }}>{message}</div>
        </form>
    );
}