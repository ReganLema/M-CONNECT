// src/services/publicApi.ts
import axios from 'axios';

// DEVELOPMENT: Use your computer's IP (same as api.ts)
const DEV_URL = __DEV__
  ? "http://192.168.0.200:8000/api"
  : "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// PRODUCTION URL
const PROD_URL = "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// ✅ Use __DEV__ flag to switch between dev and prod (same as api.ts)
const API_URL = __DEV__ ? DEV_URL : PROD_URL;

console.log('🌐 Public API URL:', API_URL);
console.log(`🚀 Mode: ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'} (No auth required)`);

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
    console.log(`✅ Public API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Public API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Network error
    if (!error.response) {
      console.error('🌐 Network Error - Cannot reach:', API_URL);
      console.error(`Check: 1) Internet connection 2) ${__DEV__ ? 'Local server is running on 192.168.0.200:8000' : 'Railway service is running'}`);
    }

    return Promise.reject(error);
  }
);

export default publicApi;