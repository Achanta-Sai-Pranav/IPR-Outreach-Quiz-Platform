import axios from "axios";

// Updated to support both Vite and CRA environment variables
const API_URL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || "http://localhost:3000/api/";

// Debug: Log the API URL being used
console.log("=== API CONFIGURATION DEBUG ===");
console.log("API URL being used:", API_URL);
console.log("Environment variables:", {
  VITE_API_URL: import.meta.env?.VITE_API_URL,
  REACT_APP_API_URL: process.env?.REACT_APP_API_URL
});
console.log("import.meta.env:", import.meta.env);
console.log("process.env:", process.env);
console.log("=== END DEBUG ===");

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 404) {
      // Handle 404 errors
      console.error("Resource not found");
      // You can redirect to a 404 page or handle it as needed
    }
    return Promise.reject(error);
  }
);

export default instance;
