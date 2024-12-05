import axios from "axios";

export const http = axios.create({
    baseURL: "https://313e-2001-12d0-2080-4100-10-31-64-fd57.ngrok-free.app/",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
});

