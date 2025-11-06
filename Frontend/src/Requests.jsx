import { useState, useEffect } from "react";
import ActivityHistory from "./ActivityHistory";
import api from "./Axios";
import { useNavigate } from "react-router-dom";


export default function Requests() {
  const [contactRequests, setContactRequests] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  // Daten abrufen 
  const loadData = async () => {
    try {
      const [contactsRes, invitesRes, sentRes] = await Promise.all([
        api.get("/show_contact_requests"),
        api.get("/show_received_activity_invites"),
        api.get("/show_sent_activity_invites")
      ]);

      setContactRequests(contactsRes.data);
      setReceivedInvites(invitesRes.data);
      setSentInvites(sentRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Kontaktanfragen beantworten 
  const respondContact = async (id, action) => {
    try {
      const res = await api.post(
        `/contact_request_respond/${id}`,
        { action });
      setMessage(res.data.message);
      loadData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error");
    }
  };

  // Aktivitätseinladung beantworten 
  const respondInvite = async (inviteId, action) => {
    try {
      const res = await api.post(
        `/respond_to_activity_invites/${inviteId}`,
        { action });
      setMessage(res.data.message);
      loadData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 ">
      <h2 className="text-2xl">Requests & Invites</h2>

      {message && (
        <p className="text-[#F28705] font-medium mb-4">{message}</p>
      )}

      {/*Kontaktanfragen*/}
      <div className=" bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-center">Contact Requests</h3>
        {contactRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No contact requests</p>
        ) : (
          contactRequests.map((req) => (
            <div
              key={req.request_id}
              className="flex flex-col md:flex-row justify-between items-center gap-4 border-b p-5"
            >
              <span >{req.sender_name}</span>
                <button
                  onClick={() => navigate(`/other_profile/${req.sender_id}`)}
                  className="bg-[#F28705] text-white rounded px-3 py-1 text-sm hover:scale-105 transition-transform cursor-pointer drop-shadow-sm  md:w-1/2"
                >
                  {req.sender_name}'s Profile
                </button>
              

              <div className="flex gap-2">
                <button
                  onClick={() => respondContact(req.request_id, "accept")}
                  className="bg-gray-50 text-black px-3 py-1 rounded text-sm drop-shadow-md hover:scale-110 cursor-pointer hover:bg-green-500"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondContact(req.request_id, "decline")}
                  className="bg-gray-50 text-black px-3 py-1 rounded text-sm drop-shadow-md hover:scale-110 cursor-pointer hover:bg-red-500 hover:text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/*Erhaltene Aktivitätseinladungen*/}
      <div className=" bg-white p-6 rounded-lg shadow flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-center">Activity Invites</h3>
        {receivedInvites.length === 0 ? (
          <p className="text-sm text-gray-500">No activity invites</p>
        ) : (
          receivedInvites.map((inv) => (
            <div
              key={inv.invite_id}
              className="border-b flex flex-col gap-1 items-center md:w-88"
            >
              <p className="font-medium">
                From: <span className="text-[#F28705]">{inv.from}</span>
              </p>

              <p className="text-md">
                Activity: {inv.activity}</p>

              <p className="text-md text-center">
                Date: {inv.date}</p>

              <h1 className="text-2xl font-anotherhand text-[#F28705] ">
                Join me?
              </h1>

              <div className="flex gap-2 mt-2 pb-3">
                <button
                  onClick={() => respondInvite(inv.invite_id, "accept")}
                  className="bg-gray-50 text-black px-3 py-1 rounded text-sm drop-shadow-md hover:scale-110 cursor-pointer hover:bg-green-500"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondInvite(inv.invite_id, "decline")}
                  className="bg-gray-50 text-black px-3 py-1 rounded text-sm drop-shadow-md hover:scale-110 cursor-pointer hover:bg-red-500 hover:text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gesendete Einladungen Übersicht*/}
      <div className="md:w-100 md:p-5 bg-white p-4 rounded-lg shadow ">
        <h3 className="text-lg font-semibold mb-2 text-center">Sent Activity Invites</h3>
        {sentInvites.length === 0 ? (
          <p className="text-sm text-gray-500">No sent invites</p>
        ) : (
          sentInvites.map((inv, i) => (
            <div
              key={i}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <p className="flex">To: {inv.to} </p>
                <p className="text-sm">
                  {inv.activity} 📆 {inv.date}
                </p>
   
              <h2
                className={`text-sm font-semibold ${
                  inv.status === "accepted"
                  ? "text-green-600"
                  : inv.status === "declined"
                  ? "text-red-600"
                  : "text-gray-500"
                }`}
                >{inv.status}                
              </h2>
                </div>

            </div>
          ))
        )}
      </div>
      <ActivityHistory/>
      
    </div>
  );
}
