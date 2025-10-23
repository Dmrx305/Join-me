import { useContext, useState } from "react";
import api from "./Axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function DeleteProfile() {
   const [message,setMessage] = useState("")
   const navigate = useNavigate()
   const {logout} = useContext(AuthContext);

  
     const handleDelete = async() => {
      if (!window.confirm("Are you sure you want to delete youre profile?"))return;

       try {
         const res = await api.delete("/delete_user");
         setMessage(res.data.message || "User deleted");
         logout();
         setTimeout(() => navigate("/login"), 1000);
       }catch(err) {
            console.error("Error deleting profile", err);
            setMessage(err.response?.data?.error || "Error deleting user");
         }}

     return(
        <>
        <button className="bg-white drop-shadow-md p-1 text-sm rounded-sm hover:scale-105 hover:bg-[#FFCA7B] cursor-pointer transition" onClick={handleDelete}>Delete Profile</button>
        </>
     )
}