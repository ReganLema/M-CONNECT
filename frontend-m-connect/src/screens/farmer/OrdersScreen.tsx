// src/screens/farmer/OrdersScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ShoppingBag, Clock, CheckCircle } from "lucide-react-native";
import { getFarmerOrders, FarmerOrder } from "@/services/farmerOrderService";

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export default function SellerOrdersScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderStatus>("pending");

  const fetchOrders = async () => {
    try {
      const data = await getFarmerOrders(filter);
      setOrders(data);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [filter])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [filter]);

  
  const filteredOrders = orders;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock size={14} color={getStatusColor(status)} />;
      case 'completed':
        return <CheckCircle size={14} color={getStatusColor(status)} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-gray-600">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-6">
      {/* ================= HEADER ================= */}
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        Incoming Orders
      </Text>
      <Text className="text-gray-500 mb-6">
        Manage orders from buyers
      </Text>

      {/* ================= FILTER TABS ================= */}
      <View className="flex-row bg-white rounded-2xl p-1 shadow-sm mb-6">
        {(['pending', 'processing', 'completed', 'cancelled'] as OrderStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            className={`flex-1 py-3 rounded-xl ${
              filter === tab ? "bg-emerald-500" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold text-xs ${
                filter === tab ? "text-white" : "text-gray-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= EMPTY STATE ================= */}
      {filteredOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-20">
          <ShoppingBag size={48} color="#9CA3AF" />
          <Text className="text-gray-400 mt-4 text-base">
            No {filter} orders yet
          </Text>
          {filter === 'pending' && (
            <Text className="text-gray-300 text-sm mt-2">
              New orders will appear here
            </Text>
          )}
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("SellerOrderDetails", { orderId: order.id })
              }
              className={`bg-white rounded-3xl p-5 mb-4 shadow-sm border ${
                order.is_new ? "border-emerald-200" : "border-gray-100"
              }`}
            >
              {/* New Badge */}
              {order.is_new && (
                <View className="absolute top-3 right-3 bg-emerald-100 px-3 py-1 rounded-full">
                  <Text className="text-emerald-600 text-xs font-semibold">
                    NEW
                  </Text>
                </View>
              )}

              {/* Buyer Info */}
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {order.buyer_name}
                  </Text>
                  {order.buyer_location && (
                    <Text className="text-gray-500 text-sm mt-1">
                      📍 {order.buyer_location}
                    </Text>
                  )}
                </View>
                <Text className="text-lg font-bold text-emerald-600">
                  {order.total_amount.toLocaleString()} TZS
                </Text>
              </View>

              {/* Product Summary */}
              <Text className="text-gray-500 mt-2">
                {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                {order.items[0] && ` • ${order.items[0].product_name}`}
                {order.items_count > 1 && ' + more'}
              </Text>

              {/* Footer */}
              <View className="flex-row justify-between items-center mt-4">
                {/* Date */}
                <View className="flex-row items-center">
                  <Clock size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  className={`px-4 py-1.5 rounded-full flex-row items-center ${
                    `bg-${getStatusColor(order.status).replace('#', '')}10`
                  }`}
                  style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                >
                  {getStatusIcon(order.status)}
                  <Text
                    className="ml-2 text-xs font-semibold"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}