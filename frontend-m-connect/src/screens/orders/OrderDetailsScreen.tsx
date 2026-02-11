// src/screens/orders/OrderDetailsScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/api";

const { width } = Dimensions.get("window");

type OrderItem = {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  total_amount: number | string;
  status: string; // ✅ Use status consistently
  payment_status: string;
  created_at: string;
  items: OrderItem[];
};

export default function OrderDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      
      // ✅ Map backend response to match our type
      const orderData = res.data.order;
      setOrder({
        id: orderData.id,
        total_amount: orderData.total_amount,
        status: orderData.status || "pending",
        payment_status: orderData.payment_status || "unpaid",
        created_at: orderData.created_at,
        items: orderData.items || [],
      });
    } catch (err) {
      console.error("❌ Failed to load order", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: confirmCancel,
        },
      ]
    );
  };

  const confirmCancel = async () => {
    try {
      setCancelLoading(true);
      await api.post(`/orders/${orderId}/cancel`);
      Alert.alert("Success", "Order cancelled successfully");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to cancel order"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16A34A" />
        <Text className="text-gray-500 mt-4">Loading order...</Text>
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (!order || error) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text className="text-xl font-bold mt-4">Order not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-green-500 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancel = ["pending", "processing"].includes(order.status?.toLowerCase());

  return (
    <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} className="flex-1">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 pt-16 pb-6 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 bg-white rounded-2xl justify-center items-center shadow-lg mr-4"
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View>
          <Text className="text-2xl font-bold">Order Details</Text>
          <Text className="text-gray-500">#{order.id}</Text>
        </View>
      </View>

      {/* Summary */}
      <View className="px-6 mb-6">
        <View className="bg-white rounded-3xl p-6 shadow-xl">
          <View className="flex-row justify-between mb-4">
            <Text
              className={`px-4 py-2 rounded-xl font-semibold ${statusColor(
                order.status
              )}`}
            >
              {String(order.status || "PENDING").toUpperCase()}
            </Text>

            <Text className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold">
              {String(order.payment_status || "UNPAID").toUpperCase()}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text className="ml-3 font-medium">
              {new Date(order.created_at).toDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Items */}
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 220 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-3xl p-5 mb-4 shadow-lg">
            <View className="flex-row justify-between mb-2">
              <Text className="font-bold text-lg">{item.product_name}</Text>
              <Text className="font-bold text-green-600">
                {(Number(item.price) * item.quantity).toLocaleString()} TZS
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Qty: {item.quantity}</Text>
              <Text className="text-gray-500">
                {Number(item.price).toLocaleString()} TZS
              </Text>
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View className="absolute bottom-6 left-6 right-6 space-y-3">
        {/* Total */}
        <LinearGradient
          colors={["#16A34A", "#22C55E"]}
          className="p-6 rounded-3xl"
        >
          <View className="flex-row justify-between">
            <Text className="text-white text-lg font-semibold">Total</Text>
            <Text className="text-white text-3xl font-bold">
              {Number(order.total_amount).toLocaleString()} TZS
            </Text>
          </View>
        </LinearGradient>

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity
            onPress={handleCancelOrder}
            disabled={cancelLoading}
            className="bg-red-500 py-4 rounded-3xl"
          >
            {cancelLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Cancel Order
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}