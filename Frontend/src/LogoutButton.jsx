  import { useContext } from "react";
  import { useNavigate } from "react-router-dom";
  import { AuthContext } from "./AuthContext";
  
    
  export default function LogoutButton() {
    const {logout} = useContext(AuthContext);
    const  navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/login");
    }
  

  return (
    <button
    onClick={handleLogout}
    className="bg-white w-[100px] h-[25px] flex items-center justify-center hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer transition"
    >
    Logout
    </button> 
  
)
  }