// src/services/farmerService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEVELOPMENT: Use your computer's IP (same as api.ts)
const DEV_URL = __DEV__
  ? "http://192.168.0.200:8000/api"
  : "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// PRODUCTION URL
const PROD_URL = "https://m-connect-api-main-skahnh.free.laravel.cloud/api";

// ✅ Use __DEV__ flag to switch between dev and prod (same as api.ts)
const API_BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

console.log('🌐 Farmer Service API URL:', API_BASE_URL);
console.log(`🚀 Mode: ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'}`);

export interface Farmer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  role: string;
  has_phone?: boolean;
}

export interface FarmerProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  formatted_price?: string;
  image: string;
  category: string;
  location: string;
  stock_quantity: number;
}

class FarmerService {
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try multiple token keys
      let token = await AsyncStorage.getItem('accessToken');
      if (!token) token = await AsyncStorage.getItem('userToken');
      if (!token) token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Get farmer's contact information including phone
  async getFarmerById(farmerId: number): Promise<Farmer | null> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`📤 Fetching farmer ${farmerId}...`);

      const response = await axios.get(
        `${API_BASE_URL}/farmers/${farmerId}`,
        { headers }
      );

      if (response.data.success || response.data.status === 'success') {
        console.log(`✅ Farmer ${farmerId} fetched successfully`);
        // Handle both response formats: { success: true, data } or { status: 'success', user }
        return response.data.data || response.data.user;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching farmer:', {
        farmerId,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return null;
    }
  }

  // Get farmer's products
  async getFarmerProducts(farmerId: number): Promise<FarmerProduct[]> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`📤 Fetching products for farmer ${farmerId}...`);

      const response = await axios.get(
        `${API_BASE_URL}/farmers/${farmerId}/products`,
        { headers }
      );

      if (response.data.success || response.data.status === 'success') {
        const products = response.data.data || response.data.products || [];
        console.log(`✅ Farmer ${farmerId} products fetched: ${products.length} items`);
        return products;
      }
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching farmer products:', {
        farmerId,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return [];
    }
  }

  // Update farmer's phone number
  async updateFarmerPhone(
    farmerId: number,
    phone: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`📤 Updating phone for farmer ${farmerId}...`);

      const response = await axios.put(
        `${API_BASE_URL}/farmers/${farmerId}/phone`,
        { phone },
        { headers }
      );

      console.log(`✅ Phone updated for farmer ${farmerId}`);

      return {
        success: response.data.success || response.data.status === 'success',
        message: response.data.message || 'Phone updated successfully',
      };
    } catch (error: any) {
      console.error('❌ Error updating phone:', {
        farmerId,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update phone number',
      };
    }
  }

  // Get all farmers (optional for admin features)
  async getAllFarmers(): Promise<Farmer[]> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('📤 Fetching all farmers...');

      const response = await axios.get(`${API_BASE_URL}/farmers`, { headers });

      if (response.data.success || response.data.status === 'success') {
        const farmers = response.data.data || response.data.farmers || [];
        console.log(`✅ Fetched ${farmers.length} farmers`);
        return farmers;
      }
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching farmers:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return [];
    }
  }
}

export const farmerService = new FarmerService();