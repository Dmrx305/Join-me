import { useEffect,useState } from "react"
import api from "./Axios";
import { useNavigate } from "react-router-dom";

export default function MatchingUsers() {
    const [matchingUsers, setMatchingUsers] = useState([]);
    const [message,setMessage] = useState({});
    const navigate = useNavigate()

    const loadMatchingUsers = async () => {
        const res = await api.get("/show_matching_users");
        setMatchingUsers(Array.isArray(res.data) ? res.data: []);
    }

    const sendRequest = async (receiver_id) => {
            try {
                await api.post(`/send_contact_request/${receiver_id}`);
            setMessage((prev) => ({
                ...prev,
                [receiver_id]: "Contact request sent!",
            }));
        } catch (err) {
            console.error("Failed to send request",err);
            setMessage((prev) => ({
                ...prev,
                [receiver_id]:"Error sending request!",
            }));
        }}

    useEffect(() => {
        loadMatchingUsers();
    },[]);

    return(
        <div>
        <h2 className="text-2xl flex justify-center mb-5">
        Matching Users
        </h2>

        {matchingUsers.length === 0 ? (
            <p className="flex justify-center">No Matching users in your City yet!
            </p>
        ) : (
            <div className="flex justify-center gap-10">
                {matchingUsers.map((user) => (
                    <div    key={user.user_id} className="flex flex-col border-none p-3  shadow-md rounded items-center">
                            {user.photo ? (
                            <img
                            src={`http://localhost:5000${user.photo}`}
                            alt={user.name}
                            className=""
                            />
                        ): (
                            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                            <span className="text-gray-400">No photo</span>
                            </div>
                        )}
                            <h3>{user.name}</h3>
                             <p>{user.city}</p>

                            {user.shared_interests && user.shared_interests.length > 0 && (
                            <p>Shared Interests:{""} {user.shared_interests.join(", ")}</p>
                        )}
                        <div >
                            <button
                            onClick={() => navigate(`/other_profile/${user.user_id}`)}
                            className="bg-[#F28705] text-white rounded px-3 py-1 text-sm hover:scale-105 transition-transform cursor-pointer drop-shadow-sm"
                            >
                            {user.name}'s Profile
                            </button>
                        <button
                        onClick={() => sendRequest(user.user_id)}
                        className="bg-[#F28705] text-white rounded m-3 px-3 py-1 text-sm hover:scale-105 drop-shadow-sm"
                        >Send contact request
                        </button>
                        </div>

                        {message[user.user_id] && (
                            <p className="text-green-600">
                                {message[user.user_id]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
)
};