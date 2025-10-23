import { useContext, useEffect, useState } from "react";
import api from "./Axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function MatchingUsers() {
  const [matchingUsers, setMatchingUsers] = useState([]);
  const [message, setMessage] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // eingeloggter User

  const loadMatchingUsers = async () => {
    const res = await api.get("/show_matching_users");
    setMatchingUsers(Array.isArray(res.data) ? res.data : []);
  };

  const sendRequest = async (receiver_id) => {
    try {
      await api.post(`/send_contact_request/${receiver_id}`);
      setMessage((prev) => ({
        ...prev,
        [receiver_id]: "Contact request sent!",
      }));
    } catch (err) {
      console.error("Failed to send request", err);
      setMessage((prev) => ({
        ...prev,
        [receiver_id]: "Error sending request!",
      }));
    }
  };

  useEffect(() => {
    loadMatchingUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl flex justify-center mb-5">Matching Users</h2>

      {matchingUsers.length === 0 ? (
        <p className="flex justify-center">No matching users in your city yet!</p>
      ) : (
        <div className="flex justify-center gap-10">
          {matchingUsers.map((matchingUser) => (
            <div
              key={matchingUser.user_id}
              className="flex flex-col border-none p-5 bg-white shadow-md rounded-xl items-center"
            >
              {/* Foto oder Initial */}
              {matchingUser.photo ? (
                <img className="w-24 h-32 object-fill rounded-xl border-none mx-auto mb-3 shadow-md" src={matchingUser.photo} alt={matchingUser.name} />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <span className="text-gray-500 text-3xl">
                    {matchingUser.name.slice(0, 1)}
                  </span>
                </div>
              )}

              {/* Name + City */}
              <h3 className="font-medium">{matchingUser.name}</h3>
              <p>{matchingUser.city}</p>

              {/* Interessen */}
              {matchingUser.shared_interests?.length > 0 && (
                <p>
                  Shared Interests:{" "}
                  <span className="font-medium italic">
                    {matchingUser.shared_interests.join(", ")}
                  </span>
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col p-5">
                <button
                  onClick={() => navigate(`/other_profile/${matchingUser.user_id}`)}
                  className="bg-[#F28705] text-white rounded px-3 py-1 text-sm hover:scale-105 transition cursor-pointer drop-shadow-sm"
                >
                  {matchingUser.name}'s Profile
                </button>

                <button
                  onClick={() => sendRequest(matchingUser.user_id)}
                  className="bg-[#F28705] text-white rounded m-3 px-3 py-1 text-sm hover:scale-105 drop-shadow-sm transition"
                >
                  Send contact request
                </button>
              </div>

              {/* Nachricht pro User */}
              {message[matchingUser.user_id] && (
                <p className="text-green-600">{message[matchingUser.user_id]}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
