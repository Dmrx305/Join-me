import { useState, useEffect } from "react";
import axios from "axios";
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
    <div className="flex flex-col items-center gap-10">
      <h2 className="text-2xl">Requests & Invites</h2>

      {message && (
        <p className="text-[#F28705] font-medium mb-4">{message}</p>
      )}

      {/*Kontaktanfragen*/}
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Contact Requests</h3>
        {contactRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No contact requests</p>
        ) : (
          contactRequests.map((req) => (
            <div
              key={req.request_id}
              className="flex justify-between items-center border-b py-2"
            >
              <span>{req.sender_name}</span>
                <button
                  onClick={() => navigate(`/other_profile/${req.sender_id}`)}
                  className="bg-[#F28705] text-white rounded px-3 py-1 text-sm hover:scale-105 transition-transform cursor-pointer drop-shadow-sm"
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
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Activity Invites</h3>
        {receivedInvites.length === 0 ? (
          <p className="text-sm text-gray-500">No activity invites</p>
        ) : (
          receivedInvites.map((inv) => (
            <div
              key={inv.invite_id}
              className="border-b py-2 flex flex-col gap-1"
            >
              <p className="font-medium">
                From: <span className="text-[#F28705]">{inv.from}</span>
              </p>
              <p>Activity: {inv.activity}</p>
              <p>Date: {inv.date}</p>
              <p className="text-sm italic text-gray-600">
                {inv.preset_text}
              </p>
              <div className="flex gap-2 mt-2">
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
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Sent Activity Invites</h3>
        {sentInvites.length === 0 ? (
          <p className="text-sm text-gray-500">No sent invites</p>
        ) : (
          sentInvites.map((inv, i) => (
            <div
              key={i}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <p>To: {inv.to}</p>
                <p className="text-sm">
                  {inv.activity} – {inv.date}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  inv.status === "accepted"
                    ? "text-green-600"
                    : inv.status === "declined"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {inv.status}
              </p>
            </div>
          ))
        )}
      </div>
      <ActivityHistory/>
      
    </div>
  );
}
