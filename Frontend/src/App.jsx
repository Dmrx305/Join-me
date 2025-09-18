import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import ShowMyProfile from "./ShowMyProfile";
import ShowOtherProfile from "./ShowOtherProfile";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function App() {
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Wenn nicht eingeloggt → Login/Register
  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        {showRegister ? (
          <>
            <Register onRegisterSuccess={() => setShowRegister(false)} />
            <p className="noaccountyet">
              Already registered?{" "}
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </>
        ) : (
          <>
            <Login setToken={setToken} />
            <p className="noaccountyet">
              No account yet?{" "}
              <button onClick={() => setShowRegister(true)}>
                <span className="registerlink">Register</span>
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  // Eingeloggt → Router
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
          <Link to="/profile" style={{ marginRight: "10px" }}>My Profile</Link>
        </nav>

        <Routes>
          <Route path="/" element={<h2>Welcome!</h2>} />
          {/* Eigene Profil-Seite */}
          <Route path="/profile" element={<ShowMyProfile token={token} />} />
          {/* Profil anderer Nutzer */}
          <Route path="/profile/:userId" element={<ShowOtherProfile token={token} />} />
        </Routes>
      </div>
    </Router>
  );
}
