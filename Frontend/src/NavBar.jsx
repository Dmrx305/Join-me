import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";

export default function NavBar() {

    return (
        <nav 
        className=" bg-gray-100 shadow-md mb-10">
            <div className="flex items-center justify-center p-1 gap-[1200px]">
            <p 
            className="text-5xl p-1 font-anotherhand [text-shadow:2px_4px_4px_rgba(0,0,0,0.2)] text-[#F28705]"
            >Join me!</p>

            <div 
            className="flex gap-4 ">

            <Link to="/show_my_profile"
            className="bg-white flex justify-center w-[100px] h-[25px] hover:scale-110 rounded-sm drop-shadow-md cursor-pointer"
            >My Profile
            </Link>

            <Link to="/matching_users"
            className="bg-white flex justify-center w-[100px] h-[25px] hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer"
            >Matches
            </Link>

            <Link to="/contact_requests"
            className="bg-white flex justify-center w-[100px] h-[25px] hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer"
            >Requests
            </Link>

            <Link to="/contacts"
            className="bg-white flex justify-center w-[100px] h-[25px] hover:scale-110 rounded-sm  drop-shadow-md cursor-pointer"
            >Contacts
            </Link>
            <LogoutButton />
            </div>
        </div>
        </nav>
        
    )
}