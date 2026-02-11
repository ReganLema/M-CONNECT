// src/services/farmerService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For local development - use your computer's IP for mobile testing
const API_BASE_URL = 'http://192.168.0.200:8000/api'; // Change to your Laravel server IP

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
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Get farmer's contact information including phone
  async getFarmerById(farmerId: number): Promise<Farmer | null> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE_URL}/farmers/${farmerId}`, { headers });
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching farmer:', error.response?.data || error.message);
      return null;
    }
  }

  // Get farmer's products
  async getFarmerProducts(farmerId: number): Promise<FarmerProduct[]> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE_URL}/farmers/${farmerId}/products`, { headers });
      
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching farmer products:', error.response?.data || error.message);
      return [];
    }
  }

  // Update farmer's phone number
  async updateFarmerPhone(farmerId: number, phone: string): Promise<{success: boolean; message: string}> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.put(
        `${API_BASE_URL}/farmers/${farmerId}/phone`,
        { phone },
        { headers }
      );
      
      return {
        success: response.data.success,
        message: response.data.message || 'Phone updated successfully'
      };
    } catch (error: any) {
      console.error('❌ Error updating phone:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update phone number'
      };
    }
  }

  // Get all farmers (optional for admin features)
  async getAllFarmers(): Promise<Farmer[]> {
    try {
      const token = await this.getAuthToken();
      const headers: any = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE_URL}/farmers`, { headers });
      
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching farmers:', error.response?.data || error.message);
      return [];
    }
  }
}

export const farmerService = new FarmerService();