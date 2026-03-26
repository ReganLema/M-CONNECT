// src/services/productsapi.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEVELOPMENT: Use your computer's IP (same as api.ts)
const DEV_URL = __DEV__
  ? "http://192.168.0.200:8000/api"
  : "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// PRODUCTION URL
const PROD_URL = "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// ✅ Use __DEV__ flag to switch between dev and prod (same as api.ts)
const API_URL = __DEV__ ? DEV_URL : PROD_URL;

console.log('📦 Products API URL:', API_URL);
console.log(`🚀 Mode: ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'}`);

const productsApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
productsApi.interceptors.request.use(
  async (config) => {
    try {
      // Try multiple possible token keys (same as farmerService)
      let token = await AsyncStorage.getItem('accessToken');
      if (!token) token = await AsyncStorage.getItem('userToken');
      if (!token) token = await AsyncStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 Products API: ${config.method?.toUpperCase()} ${config.url} (with token)`);
      } else {
        console.log(`📤 Products API: ${config.method?.toUpperCase()} ${config.url} (no token)`);
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Products API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
productsApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Products API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Products API Error:', {
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
    }

    return Promise.reject(error);
  }
);

export default productsApi;