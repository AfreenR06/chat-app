import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// create base instance
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
  withCredentials: true,
});