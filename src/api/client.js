import axios from "axios";

// All requests go through this single instance.
// Later: add JWT token in request interceptor, handle 401 in response interceptor.
const client = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
