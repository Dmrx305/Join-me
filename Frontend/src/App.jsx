import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";


export default function App() {
	const [token, setToken] = useState(null);
	const [showRegister, setShowRegister] = useState(false);
	const[showProfile, setShowProfile] = useState(false);

	  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        {showRegister ? (
          <>
            <Register onRegisterSuccess={() => setShowRegister(false)} />
            <p>Already reggistered? <button onClick={() => setShowRegister(false)}>Login</button></p>
          </>
        ) : (
          <>
            <Login setToken={setToken} />
            <p>No Account yet? <button onClick={() => setShowRegister(true)}>Register</button></p>
          </>
        )}
      </div>
    );
  }

	return (
	<div style={{ padding: 20 }}>
		<button onClick={() => setShowProfile(!showProfile)}>
		{showProfile ? "back" : "Edit profile"}
		</button>
		{showProfile ? (
		<Profile token={token} />
		) : (
		<h2>Welcome!</h2>
		)}
	</div>
)
}
