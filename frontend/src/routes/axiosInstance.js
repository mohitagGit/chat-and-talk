import axios from "axios";
import { useNavigate } from "react-router-dom";

var backend_url = "http://localhost:4000";
if (window.location.host === "varta-ls5r.onrender.com") {
  backend_url = "https://varta-ls5r.onrender.com";
}

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: backend_url,
  timeout: 10000,
});

// Add an interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if the error is a 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized: Redirecting to login.");
      localStorage.removeItem("current-user");
      const navigate = useNavigate();
      navigate("/");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
