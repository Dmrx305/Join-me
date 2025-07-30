import { useState } from "react";
import axios from "axios";

export default function Login({setToken}) {
    const [username, setUsername]= useState("");
    const [password, setPassword]= useState("");

    const handleLogin = async (e)=> {
        e.preventDefault();
        try{
            const res = await axios.post("http://localhost:5000/api/login",{
                username,
                password,
            });
            setToken(res.data.access_token);
            alert('Login successfull!');
            }
            catch (err) {
                alert('Login failed!');
            }
    };

    return (
        <form onSubmit={handleLogin}>
         <input value={username} onChange={e=> setUsername(e.target.value)} placeholder="Username" />
         <input type="password" value={password} onChange={e=> setPassword(e.target.value)} placeholder="Password" />
         <button type="submit">Login</button>
        </form>
    );
}
