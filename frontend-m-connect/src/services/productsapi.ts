// services/productsapi.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.199:8000/api';

const productsApi = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout for file uploads
});

// Add token to requests
productsApi.interceptors.request.use(
  async (config) => {
    try {
      // Try multiple possible token keys
      let token = await AsyncStorage.getItem('accessToken'); // Your login returns accessToken
      if (!token) {
        token = await AsyncStorage.getItem('userToken'); // Fallback
      }
      if (!token) {
        token = await AsyncStorage.getItem('token'); // Another fallback
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No authentication token found in storage');
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
productsApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Products API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

export default productsApi;