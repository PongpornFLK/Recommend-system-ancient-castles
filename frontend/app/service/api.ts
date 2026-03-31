import axios from "axios";
import { API_URL } from "@/app/config";

const api = axios.create({
  baseURL: API_URL,
});

// Check Request ( ไป )
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ใส่ token มาพร้อม header
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Check Response ( กลับ )
api.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response;
    }
    return response;
  },
  async (error) => {
    const orgRequest = error.config;

    if (error.response?.status === 401 && !orgRequest._retry) { // Token หมดอายุ ไหม

      if (orgRequest.url?.includes("/auth/token") || orgRequest.url?.includes("/users/auth/google_login")) {
        return Promise.reject(error);
      }

      orgRequest._retry = true; // กำลังขอ Token ใหม่อยู่

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") {
          throw new Error("Missing or invalid refresh token");
        }

        const response = await axios.post(`${API_URL}/auth/refreshtoken`, {
          refresh_token: refreshToken,
        });

        console.log("Refresh Token : ", response.data);

        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);

        orgRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(orgRequest);
      } catch (err) {
        console.error("Refresh Token Expired , please login again", err);
        localStorage.removeItem("token");

        localStorage.removeItem("user_id");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_provider");
        localStorage.removeItem("google_token");

        window.dispatchEvent(new Event("auth-change"));

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
