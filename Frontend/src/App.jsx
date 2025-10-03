import { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ShowMyProfile from "./ShowMyProfile";
import ProfileForm from "./ProfileForm";
import { AuthContext, AuthProvider } from "./AuthContext";
import NavBar from "./NavBar"

function AppRoutes() {
  const {token} = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);

  return (
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/show_my_profile" />
            ) : showRegister ? (
              <>
                <Register onRegisterSuccess={() => setShowRegister(false)} />
                  <div className="pt-2 text-sm">
                <p          
                  className="flex justify-center">
                  Already registered?{" "}
                  <button 
                  className="pl-1 pt- underline cursor-pointer"
                  onClick={() => setShowRegister(false)}
                  >Login</button>
                </p>
                </div>
              </>
            ) : (
              <>
                <Login/>

                <div className="pt-2 text-sm">
                  <p
                    className="flex justify-center">
                    No account yet?{" "}
                    <button
                      className="pl-1 pt- underline cursor-pointer" onClick={() => setShowRegister(true)}
                    >Register
                    </button>
                  </p>
                </div>
              </>
            )
          }
        />
        

        {/* Eigene Profil-Seite */}
        <Route
          path="/show_my_profile"
          element={token ? <ShowMyProfile /> : <Navigate to="/login" />}
        />

        {/* Profil bearbeiten */}
        <Route
          path="/create_or_update_profile"
          element={token ? <ProfileForm /> : <Navigate to="/login" />}
        />

        {/* Startseite */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
  );
}

function AppContent() {
  const { token } = useContext(AuthContext);

  return (
<div className="className=flex flex-col min-h-screen">
      {token && <NavBar />} 
      <AppRoutes />
      </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
         <AppContent/>
      
      </Router>
    </AuthProvider>
  );
}
