


// src/api/api.ts

import axios, { AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// DEVELOPMENT: Use your computer's IP
const BASE_URL = __DEV__
  ? "http://192.168.0.199:8000/api"
  : "https://yourdomain.com/api";

const API: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper to strip BOM from response
const stripBOM = (data: any): any => {
  if (typeof data === 'string') {
    // Remove UTF-8 BOM if present
    return data.replace(/^\uFEFF/, '');
  }
  return data;
};

//  REQUEST INTERCEPTOR
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error getting token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response: AxiosResponse) => {
    // Strip BOM from response data
    if (response.data) {
      if (typeof response.data === 'string') {
        response.data = stripBOM(response.data);
        try {
          response.data = JSON.parse(response.data);
        } catch (parseError) {
          // If not JSON, keep as string
        }
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error for debugging
    console.log("API Error:", {
      status: error.response?.status,
      message: error.message,
      url: originalRequest?.url,
    });

    //  NETWORK ERROR
    if (!error.response) {
      return Promise.reject(
        new Error("Cannot connect to server. Check IP, Wi-Fi, and backend.")
      );
    }

    //  TOKEN EXPIRED → TRY REFRESH
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        await AsyncStorage.multiSet([
          ["accessToken", accessToken],
          ["refreshToken", newRefreshToken],
        ]);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError: any) {
        console.log("Token refresh failed:", refreshError);
        await AsyncStorage.clear();
        return Promise.reject(
          new Error("Session expired. Please login again.")
        );
      }
    }

    //  BACKEND ERROR
    return Promise.reject(error);
  }
);

export default API;