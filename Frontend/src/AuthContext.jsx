import { createContext, useState } from "react";


export const AuthContext = createContext();

export function AuthProvider({children})  {
    const [token,setToken] = useState(false);

    const login = ()=>setToken(true);
    
    const logout = ()=> {
        setToken(null);
        localStorage.removeItem("token");
    };


    return (
        <AuthContext.Provider value={{token,login, logout}}>
        {children}
        </AuthContext.Provider>
    );
    }