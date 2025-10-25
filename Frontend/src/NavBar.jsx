import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useContext,} from "react";

export default function NavBar() {
    const {user} = useContext(AuthContext);

    return (
        <nav className="bg-white shadow-md mb-10">
            <div className="relative flex items-center  justify-evenly md:justify-between p-3 mx-5">

            {/* Left */}
            <h1 className="font-anotherhand text-xl md:text-5xl text-[#F28705]" 
            >
            Join me!            
            </h1>

            {/* Center */}
            <h1 className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center md:text-3xl p-1 font-anotherhand text-[#444444]">
            Hi {user?.name}!
            </h1>
            
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