import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import ProtectedPage from "./ProtectedPage";


export default function App() {
	const [token, setToken] = useState(null);
	const [showRegister, setShowRegister] =useState(false);

	if (token) {
		return <ProtectedPage token={token} />
	}

	return (
		<div style={{padding:20}}>
			{showRegister ? (
				<>
				<Register onRegisterSuccess={() => setShowRegister(false)}/>
					<p> Already have account? <button onClick={() => setShowRegister(false)}>To Login</button></p>
				</>
			):(
				<>
				<Login setToken={setToken} />
				<p>No account yet? <button onClick={() => setShowRegister(true)}>Register</button></p>
				</>
			)}
		</div>
	);
}