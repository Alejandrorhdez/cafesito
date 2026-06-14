import axios from "axios";

const APP_BASE_URL = process.env.REACT_APP_API_BASE_URL;

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

export const http = axios.create({
  baseURL: APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refresh } = await import("./auth");
        const newToken = await refresh();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return http(originalRequest);
        }
      } catch (error) {
        console.error("Error en refresh token", error);
      }

      if (typeof logoutCallback === "function") {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  },
);
