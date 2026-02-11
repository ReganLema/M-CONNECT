

// src/services/publicApi.ts


import axios from 'axios';

// Use your actual IP - Make sure it matches your backend
const API_URL = 'http://192.168.0.198:8000/api';

const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// NO REQUEST INTERCEPTOR - No token needed for public endpoints

// Response interceptor
publicApi.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ Public API [${response.config.method?.toUpperCase()} ${response.config.url}]:`, {
        status: response.status,
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ Public API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default publicApi;