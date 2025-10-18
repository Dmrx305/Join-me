import { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ShowMyProfile from "./ShowMyProfile";
import ProfileForm from "./ProfileForm";
import { AuthContext, AuthProvider } from "./AuthContext";
import NavBar from "./NavBar"
import MatchingUsers from "./MatchingUsers";
import Contacts from "./Contacts"
import ShowOtherProfile from "./ShowOtherProfile";
import Requests from "./Requests";
import ActivityHistory from "./ActivityHistory";
import DeleteProfile from "./DeleteProfile";



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
                  className="pl-1 underline cursor-pointer hover:scale-110"
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
                      className="pl-1 underline cursor-pointer hover:scale-105" onClick={() => setShowRegister(true)}
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
        <Route path="/" element={<Navigate to="/login" />}
         />

        {/* Matches */}
        <Route 
          path="/matching_users"
          element={token? <MatchingUsers /> : <Navigate to="/login" />}
        />

        {/* Anfragen */}
        <Route 
          path="/contact_requests"
          element={token? <Requests /> : <Navigate to="/login" />}
        />

        {/* Kontakte */}
        <Route 
          path="/contacts"
          element={token? <Contacts /> : <Navigate to="/login" />}
        />

         {/* Andere User Profile */}
        <Route 
          path="/other_profile/:userId"
          element={token? <ShowOtherProfile /> : <Navigate to="/login" />}
        />

        {/* Activity History*/}
        <Route 
          path="/activity_history"
          element={token? <ActivityHistory /> : <Navigate to="/login" />}
        />

        {/* Delete User*/}
        <Route 
          path="/delete_user"
          element={token? <DeleteProfile /> : <Navigate to="/login" />}
        />
      </Routes>
  );
}

function AppContent() {
  const { token } = useContext(AuthContext);

  return (
<div> 
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
