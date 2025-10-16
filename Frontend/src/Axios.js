import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,   // Vite
  // baseURL: process.env.REACT_APP_API_BASE_URL, // CRA
  withCredentials: true,
});

export default api;