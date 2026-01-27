import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Sending token:", token); // Debug log
    } else {
      console.warn("No token found in localStorage for request:", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;