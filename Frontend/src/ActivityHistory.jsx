import { useState, useEffect } from "react";
import api from "./Axios";

export default function ActivityHistory() {
  const [acceptedActivities, setAcceptedActivities] = useState([]);
  const [message, setMessage] = useState("");

  const loadAcceptedActivities = async () => {
    try {
      const res = await api.get("/show_accepted_activities");
      setAcceptedActivities(res.data);
    } catch (err) {
      console.error("Failed to load accepted activities:", err);
      setMessage("Could not load activities");
    }
  };

  useEffect(() => {
    loadAcceptedActivities();
  }, []);

  return (
    <div className="flex flex-col items-center mb-5">
      

      {message && (
        <p className="text-red-500 mb-4 font-medium">{message}</p>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        {acceptedActivities.length === 0 ? (
          <p className="text-gray-500 text-center">
            No accepted activities yet.
          </p>
        ) : (
          <div className=" bg-white">

            <h2 className="text-xl font-semibold  text-[#F28705]">
            Accepted Activities
            </h2>

            {acceptedActivities.map((a, i) => (
              <div key={i} className="py-3 flex flex-col">

                <p className="font-semibold text-[#F28705]">
                  {a.activity}
                </p>                
                <p className="text-sm text-gray-700">Date: {a.date}</p>
                <p className="text-sm text-gray-700">With: {a.partner}</p>
                <p className="text-xs italic text-gray-500">
                  You are the {a.role}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
