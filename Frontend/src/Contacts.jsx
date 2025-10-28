import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./Axios";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const loadContacts = async () => {
    try {
      const res = await api.get("/show_contacts");
      setContacts(res.data);
    } catch (err) {
      console.log("Failed to load contacts", err);
    }
  };

  const deleteContact = async (contact_id) => {
    try {
      await api.delete(`/delete_contact/${contact_id}`);
      loadContacts();
    } catch(err) {
      console.error("Failed to delete contact",err);
    }
  }

  const sendInvite = async () => {
    if (!selectedContact) return;
    try {
      const res = await api.post(
        `/send_activity_invite/${selectedContact.user_id}`,
        { activity, date }
      );

      setMessage(res.data.message);
      setShowInvite(false);
      setActivity("");
      setDate("");
      setLocation("");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to send invite");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-10">My Contacts</h2>

      {contacts.length === 0 ? (
        <p>No Contacts yet</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-10">
          {contacts.map((c) => (
            <div
              key={c.user_id}
              className="drop-shadow-md p-5 rounded-lg shadow w-[200px] text-center bg-white"
            >
              {c.profile.photo ? (
                <img
                  src={c.profile.photo}
                  alt={c.profile.name}
                  className="w-24 h-32 object-fill rounded-xl border-none mx-auto mb-3 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 drop-shadow-sm">
                  <span>No Photo</span>
                </div>
              )}

              <p>{c.profile.name || c.username}</p>

              <div className="flex flex-col gap-2 mt-3">
                {/*  Show Other Profile Button*/}
                <button
                  onClick={() => navigate(`/other_profile/${c.user_id}`)}
                  className="bg-[#F28705] text-white rounded px-3 py-1 text-sm hover:scale-105 transition-transform cursor-pointer shadow-md"
                >
                  {c.profile.name}'s Profile
                </button>
                {/*  Invite to activity Button*/}
                <button
                  onClick={() => {
                    setSelectedContact(c);
                    setShowInvite(true);
                  }}
                  className="bg-white border border-[#F28705] text-[#F28705] cursor-pointer rounded px-3 py-1 text-sm hover:bg-[#F28705] hover:text-white transition-colors shadow-md"
                >
                  Invite to Activity
                </button>
                {/*  Delete Contact*/}
                {contacts.map(c=> (
                  <div key={c.user_id} className="flex justify-center items-center ">
                  <button onClick={() => deleteContact(c.user_id)}
                  className="text-red-500 hover:scale-105 border-1 rounded-md px-1 shadow-md transition" >
                    Delete Contact
                  </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/*  Show Invite Panel */}
      {showInvite && selectedContact && (
        <div className="flex justify-center items-center mt-7">
          <div className="rounded-lg p-6 w-[300px] flex flex-col gap-3 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">
              Invite {selectedContact.profile.name}
            </h2>

            <input
              type="text"
              placeholder="Activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded"
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={sendInvite}
                className="bg-[#F28705] text-white px-3 py-1 rounded hover:scale-105 transition-transform"
              >
                Send Invite
              </button>

              <button
                onClick={() => setShowInvite(false)}
                className="bg-gray-300 text-black px-3 py-1 rounded hover:scale-105 transition-transform"
              >
                Cancel
              </button>
            </div>

            {message && (
              <p className="text-sm text-center mt-2 text-[#F28705]">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
