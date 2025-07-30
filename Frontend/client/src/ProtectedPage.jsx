import { useEffect, useState } from "react";
import axios from "axios";

export default function ProtectedPage({ token }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => setMessage(res.data.message))
    .catch(() => setMessage("Nicht autorisiert"));
  }, [token]);

  return <div>{message}</div>;
}


