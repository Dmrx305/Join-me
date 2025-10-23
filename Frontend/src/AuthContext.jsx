import { createContext, useEffect, useState } from "react";
import api from "./Axios";


export const AuthContext = createContext();

export function AuthProvider({children})  {
    const [token,setToken] = useState(false);
    const [user,setUser] = useState(null)

    const login = ()=>setToken(true);
    
    const logout = ()=> {
        setToken(null);
        localStorage.removeItem("token");
    };
    
    useEffect(() => {
    if (token) {
      api
        .get("/show_my_profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, [token]);

    return (
        <AuthContext.Provider value={{token,login, logout, user, setUser}}>
        {children}
        </AuthContext.Provider>
    );
    }