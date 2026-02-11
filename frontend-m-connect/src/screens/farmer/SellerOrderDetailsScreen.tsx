// src/screens/farmer/OrderDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  User, 
  Phone, 
  MapPin,
  Package,
  DollarSign,
  Calendar
} from "lucide-react-native";
import { getFarmerOrderDetails, updateOrderStatus, FarmerOrder } from "@/services/farmerOrderService";

export default function SellerOrderDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<FarmerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getFarmerOrderDetails(orderId);
      setOrder(data);
    } catch (error: any) {
      Alert.alert("Error", "Failed to load order details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'processing' | 'completed' | 'cancelled') => {
    if (!order) return;
    
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert("Success", "Order status updated");
      fetchOrderDetails(); // Refresh data
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-gray-600">Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ShoppingBag size={48} color="#9CA3AF" />
        <Text className="text-gray-400 mt-4 text-lg">Order not found</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mt-6 bg-emerald-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white rounded-b-3xl px-6 pt-12 pb-8 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Order #{order.id}</Text>
        <View className="flex-row items-center mt-2">
          <Calendar size={16} color="#6B7280" />
          <Text className="text-gray-500 ml-2">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      {/* Status Card */}
      <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm">
        <Text className="text-gray-500 mb-2">Order Status</Text>
        <View className="flex-row justify-between items-center">
          <View 
            className="px-5 py-3 rounded-full"
            style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
          >
            <Text 
              className="font-bold text-lg"
              style={{ color: getStatusColor(order.status) }}
            >
              {order.status.toUpperCase()}
            </Text>
          </View>
          
          {/* Status Update Buttons */}
          {order.status === 'pending' && (
            <TouchableOpacity
              onPress={() => handleStatusUpdate('processing')}
              disabled={updating}
              className="bg-blue-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">
                {updating ? 'Processing...' : 'Start Processing'}
              </Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'processing' && (
            <TouchableOpacity
              onPress={() => handleStatusUpdate('completed')}
              disabled={updating}
              className="bg-emerald-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">
                {updating ? 'Updating...' : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Customer Info */}
      <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Customer Information</Text>
        
        <View className="flex-row items-center mb-3">
          <User size={20} color="#6B7280" />
          <Text className="text-gray-700 ml-3 text-lg">{order.buyer_name}</Text>
        </View>
        
        {order.buyer_phone && (
          <View className="flex-row items-center mb-3">
            <Phone size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3">{order.buyer_phone}</Text>
          </View>
        )}
        
        {order.buyer_location && (
          <View className="flex-row items-start">
            <MapPin size={20} color="#6B7280" className="mt-1" />
            <Text className="text-gray-700 ml-3 flex-1">{order.buyer_location}</Text>
          </View>
        )}
      </View>

      {/* Order Items */}
      <View className="bg-white mx-5 my-5 rounded-3xl p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Order Items</Text>
        
        {order.items.map((item, index) => (
          <View 
            key={item.id} 
            className={`pb-4 ${index < order.items.length - 1 ? 'border-b border-gray-100 mb-4' : ''}`}
          >
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-semibold">{item.product_name}</Text>
              <Text className="text-emerald-600 font-bold">
                {(item.price * item.quantity).toLocaleString()} TZS
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-500">Qty: {item.quantity}</Text>
              <Text className="text-gray-500">{item.price.toLocaleString()} TZS each</Text>
            </View>
          </View>
        ))}
        
        {/* Order Total */}
        <View className="border-t border-gray-200 pt-4 mt-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
            <Text className="text-2xl font-bold text-emerald-600">
              {order.total_amount.toLocaleString()} TZS
            </Text>
          </View>
          
          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center">
              <Package size={16} color="#6B7280" />
              <Text className="text-gray-500 ml-2">{order.items_count} items</Text>
            </View>
            <View className="flex-row items-center">
              <DollarSign size={16} color="#6B7280" />
              <Text className="text-gray-500 ml-2">
                Payment: {order.payment_status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}