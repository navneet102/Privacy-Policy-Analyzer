import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://privacy-policy-analyser.onrender.com",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
export default axiosInstance;