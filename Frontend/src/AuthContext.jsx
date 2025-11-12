import { createContext, useEffect, useState } from "react";
import api from "./Axios";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null)

  const login = (jwt) => {
    setToken(jwt);
    localStorage.setItem("token", jwt);
  }

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    if (token) {
      api
        .get("/show_my_profile")
        .then((res) => setUser(res.data))
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            setUser({ profileMissing: true });
          } else {
            setUser(null);
          }
        });
    }
  }, [token]);


  return (
    <AuthContext.Provider value={{ token, login, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}