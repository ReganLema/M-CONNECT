

// src/services/api.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Use your actual IP - Make sure it matches your backend
const API_URL = 'http://192.168.0.199:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds for slower connections
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper function to get token
const getToken = async (): Promise<string | null> => {
  try {
    // Try multiple token storage keys
    let token = await AsyncStorage.getItem('accessToken');
    if (!token) token = await AsyncStorage.getItem('userToken');
    if (!token) token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Request interceptor error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (__DEV__) {
      console.log(`✅ API Success [${response.config.method?.toUpperCase()} ${response.config.url}]:`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // You can handle global error actions here
    // For example, show alerts or trigger logout
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.log('🔐 Unauthorized access - Token may be expired');
      // Optional: Clear token and redirect to login
      // AsyncStorage.removeItem('accessToken');
      // navigationRef.navigate('Login');
    } else if (error.response?.status === 404) {
      console.log('🔍 Resource not found');
    } else if (error.response?.status === 500) {
      console.log('💥 Server error');
    } else if (!error.response) {
      console.log('🌐 Network error - Check internet connection');
    }

    return Promise.reject(error);
  }
);

// Helper function to extract data from various API response structures
export const extractApiData = (responseData: any): any => {
  if (!responseData) return null;
  
  // Handle different API response structures
  if (responseData.status === 'success') {
    // Structure 1: { status: 'success', data: {...} }
    return responseData.data;
  } else if (responseData.data) {
    // Structure 2: { data: {...} }
    return responseData.data;
  } else if (responseData.products || responseData.product || responseData.farmer) {
    // Structure 3: Direct data object
    return responseData;
  }
  
  // Fallback: Return the whole response
  return responseData;
};

// Helper to extract nested product/farmer data
export const extractProductData = (data: any): any => {
  if (!data) return null;
  
  // Check for nested product
  if (data.product) return data.product;
  if (data.products && Array.isArray(data.products)) return data.products[0];
  
  // Already product data
  return data;
};

export const extractFarmerData = (data: any): any => {
  if (!data) return null;
  
  // Check for nested farmer
  if (data.farmer) return data.farmer;
  if (data.farmers && Array.isArray(data.farmers)) return data.farmers[0];
  
  // Already farmer data
  return data;
};

export default api;