// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// ✅ DEVELOPMENT URL - Use your computer's IP
const DEV_URL = __DEV__
  ? "http://192.168.0.200:8000/api"
  : "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// ✅ PRODUCTION URL
const PROD_URL = "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// ✅ Use __DEV__ flag to switch between dev and prod
const API_URL = __DEV__ ? DEV_URL : PROD_URL;

console.log('🌐 API Base URL:', API_URL);
console.log(`🚀 Mode: ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'}`);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

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

// Helper function to clear all auth tokens
const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userToken',
      'token',
      'user',
    ]);
    console.log('🗑️ All tokens cleared');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 ${config.method?.toUpperCase()} ${config.url} (with token)`);
      } else {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url} (no token)`);
      }
    } catch (error) {
      console.error('Request interceptor error:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request setup failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log detailed error information
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('🌐 Network error - Cannot reach server:', API_URL);
      console.error(`Check: 1) Internet connection 2) ${__DEV__ ? 'Local server is running on 192.168.0.200:8000' : 'Railway service is running'}`);
      
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your internet connection and try again.'
      );
      
      return Promise.reject(new Error('Cannot connect to server. Check network or backend.'));
    }

    // Token refresh logic for 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting token refresh...');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh token
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Store new tokens
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefreshToken || refreshToken],
        ]);

        console.log('✅ Token refreshed successfully');

        // Update auth header
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Notify subscribers
        onRefreshed(accessToken);

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear all tokens
        await clearTokens();
        
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.'
        );
        
        return Promise.reject(new Error('Session expired. Please login again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other status codes
    switch (error.response?.status) {
      case 403:
        console.error('🔒 Forbidden - Access denied');
        Alert.alert('Access Denied', 'You do not have permission to perform this action.');
        break;
        
      case 404:
        console.error('🔍 Not Found - Endpoint does not exist');
        break;
        
      case 422:
        console.error('📝 Validation Error:', error.response.data);
        break;
        
      case 429:
        console.error('⏳ Rate limit exceeded');
        Alert.alert('Rate Limit', 'Too many requests. Please try again later.');
        break;
        
      case 500:
      case 502:
      case 503:
        console.error('💥 Server Error - Backend issue');
        Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
        break;
    }

    return Promise.reject(error);
  }
);

// Helper function to extract data from various API response structures
export const extractApiData = (responseData: any): any => {
  if (!responseData) return null;
  
  // Handle different API response structures
  if (responseData.status === 'success') {
    // Structure: { status: 'success', data: {...} }
    return responseData.data;
  }
  
  if (responseData.success && responseData.data) {
    // Structure: { success: true, data: {...} }
    return responseData.data;
  }
  
  if (responseData.data) {
    // Structure: { data: {...} }
    return responseData.data;
  }
  
  if (responseData.results) {
    // Structure for paginated results: { results: [...], count, next, previous }
    return responseData.results;
  }
  
  // Already unwrapped data or other structure
  return responseData;
};

// Generic data extractor with type safety
export const extractData = <T>(responseData: any): T | null => {
  const extracted = extractApiData(responseData);
  return extracted as T || null;
};

// Helper to extract product data
export const extractProductData = <T = any>(data: any): T | null => {
  if (!data) return null;
  
  // Check for direct product object
  if (data.id && (data.name || data.product_name || data.price)) {
    return data as T;
  }
  
  // Check for nested product
  if (data.product) return data.product as T;
  
  // Check for products array and return first item
  if (data.products && Array.isArray(data.products) && data.products.length > 0) {
    return data.products[0] as T;
  }
  
  // Try to extract using the generic extractor
  const extracted = extractApiData(data);
  if (extracted && extracted !== data) {
    return extractProductData<T>(extracted);
  }
  
  return null;
};

// Helper to extract farmer data
export const extractFarmerData = <T = any>(data: any): T | null => {
  if (!data) return null;
  
  // Check for direct farmer object
  if (data.id && (data.name || data.farm_name || data.location)) {
    return data as T;
  }
  
  // Check for nested farmer
  if (data.farmer) return data.farmer as T;
  
  // Check for farmers array and return first item
  if (data.farmers && Array.isArray(data.farmers) && data.farmers.length > 0) {
    return data.farmers[0] as T;
  }
  
  // Try to extract using the generic extractor
  const extracted = extractApiData(data);
  if (extracted && extracted !== data) {
    return extractFarmerData<T>(extracted);
  }
  
  return null;
};

// Helper to extract array data (for lists)
export const extractArrayData = <T = any>(data: any): T[] => {
  if (!data) return [];
  
  const extracted = extractApiData(data);
  
  if (Array.isArray(extracted)) {
    return extracted as T[];
  }
  
  if (extracted?.data && Array.isArray(extracted.data)) {
    return extracted.data as T[];
  }
  
  if (extracted?.results && Array.isArray(extracted.results)) {
    return extracted.results as T[];
  }
  
  return [];
};

// Helper to check if response was successful
export const isSuccessResponse = (responseData: any): boolean => {
  if (!responseData) return false;
  
  return (
    responseData.status === 'success' ||
    responseData.success === true ||
    responseData.status === 200 ||
    responseData.status === 201
  );
};

// Helper to get error message from response
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export default api;