import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";

export default function NavBar() {

    return (
        <nav 
        className=" bg-gray-100 shadow-md">
            <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <p 
            className="text-4xl  font-anotherhand text-[#F28705]"
            >Join me!</p>

            <div 
            className=" flex flex-row space-x-4 items-center mr-25">
            <Link to="/show_my_profile"
            className="bg-white w-[100px] h-[25px] hover:scale-110 justify-center rounded-sm  drop-shadow-md cursor-pointer"
            >My Profile
            </Link>

            <LogoutButton />
            </div>
        </div>
        </nav>
        
    )
}