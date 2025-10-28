import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useContext,} from "react";

export default function NavBar() {
    const {user} = useContext(AuthContext);

    return (
        <nav className="bg-white shadow-md mb-5">
            <div className="md:relative flex items-center justify-evenly md:justify-between md:p-2 md:mx-5">

            <div className="flex flex-col items-center m-1">
            {/* Left */}
            <h1 className="font-anotherhand text-xl md:text-4xl text-[#F28705]">
            Join me!            
            </h1>

            {/* Center */}
            <p className=" text-[#444444]">
            Hi {user?.name}
            </p>
            </div>
            
            {/* Right */}
            <div className="flex gap-1 md:gap-4 ">               
            <Link to="/show_my_profile"
            className="bg-white flex justify-center items-center w-[60px] h-[18px] md:w-[100px] md:h-[25px] hover:scale-110 rounded-sm drop-shadow-md cursor-pointer transition text-xs md:text-md"
            >My Profile
            </Link>

            <Link to="/matching_users"
            className="bg-white flex justify-center items-center w-[60px] h-[18px] md:w-[100px] md:h-[25px] hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer transition text-xs md:text-md"
            >Matches
            </Link>

            <Link to="/contact_requests"
            className="bg-white flex justify-center items-center w-[60px] h-[18px] md:w-[100px] md:h-[25px] hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer transition text-xs md:text-md"
            >Requests
            </Link>

            <Link to="/contacts"
            className="bg-white flex justify-center items-center w-[60px] h-[18px] md:w-[100px] md:h-[25px] hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer transition text-xs md:text-md"
            >Contacts
            </Link>
            <LogoutButton />
            </div>
        </div>
        </nav>
        
    )
}