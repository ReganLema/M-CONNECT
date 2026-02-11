// src/screens/farmer/DashboardScreen.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { PlusCircle, ShoppingCart, DollarSign, CheckCircle } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import Card from "../../components/farmerCard";
import Skeleton from "../../components/farmerSkeleton";
import api from "@/services/productsapi";
import { getFarmerOrders } from "@/services/farmerOrderService";

type DashboardStats = {
  totalProducts: number;
  completedOrders: number; // ✅ Changed from pendingOrders
  totalEarnings: number;
};

const FarmerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0); // ✅ Track separately for alerts
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch products count
      const productsResponse = await api.get('/products');
      const productsData = productsResponse.data?.data?.products || productsResponse.data?.products || [];
      const totalProducts = Array.isArray(productsData) ? productsData.length : 0;

      // Fetch all orders
      const allOrders = await getFarmerOrders();

      // ✅ Count COMPLETED orders (not pending)
      const completedOrders = allOrders.filter(order => order.status === 'completed').length;

      // Track pending orders for alert (but don't show in main stats)
      const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
      setPendingOrdersCount(pendingOrders);

      // ✅ Calculate total earnings from COMPLETED orders only
      const totalEarnings = allOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalProducts,
        completedOrders, // ✅ Show completed orders
        totalEarnings,
      });

      console.log('📊 Dashboard Stats:', {
        totalProducts,
        completedOrders, // ✅ Matches earnings
        pendingOrders,   // ✅ For alerts only
        totalEarnings: `${totalEarnings.toLocaleString()} TZS`,
      });

    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
      
      setStats({
        totalProducts: 0,
        completedOrders: 0,
        totalEarnings: 0,
      });
      setPendingOrdersCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch stats on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardStats();
    }, [])
  );

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-gray-50 px-4 pt-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">
            Hello, Farmer 👩‍🌾
          </Text>
          <Text className="text-gray-500 mt-1">
            Loading your dashboard...
          </Text>
        </View>
        <Skeleton count={3} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4 pt-6"
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-900">
          Hello, Farmer 👩‍🌾
        </Text>
        <Text className="text-gray-500 mt-1">
          Manage your products & orders
        </Text>
      </View>

      {!stats ? (
        <View className="mt-20 items-center">
          <Text className="text-gray-400 text-lg text-center">
            Start by adding your first product.
          </Text>
        </View>
      ) : (
        <>
          {/* ================= STATS SECTION ================= */}
          <View className="bg-white rounded-3xl p-4 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Overview
              </Text>
              <TouchableOpacity onPress={fetchDashboardStats}>
                <Text className="text-emerald-600 text-sm">Refresh</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-4">
              {/* Products Card */}
              <Card
                title="Products"
                value={stats.totalProducts.toString()}
                icon={<PlusCircle size={26} color="#22C55E" />}
              />

              {/* ✅ COMPLETED ORDERS (not pending) */}
              <Card
                title="Completed Orders"
                value={stats.completedOrders.toString()}
                icon={<CheckCircle size={26} color="#10B981" />}
              />

              {/* Earnings Card */}
              <Card
                title="Total Earnings"
                value={`${stats.totalEarnings.toLocaleString()} TZS`}
                icon={<DollarSign size={26} color="#F59E0B" />}
              />
            </View>

            {/* ✅ Info Message */}
            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-gray-500 text-xs text-center">
                Showing completed orders and confirmed earnings
              </Text>
            </View>
          </View>

          {/* ================= PENDING ORDERS ALERT ================= */}
          {pendingOrdersCount > 0 && (
            <View className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
              <View className="flex-row items-start">
                <View className="bg-amber-100 rounded-full p-2 mr-3">
                  <ShoppingCart size={20} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-amber-800 font-semibold mb-1">
                    ⚠️ Pending Orders
                  </Text>
                  <Text className="text-amber-700 text-sm mb-3">
                    You have {pendingOrdersCount} order{pendingOrdersCount !== 1 ? 's' : ''} waiting for processing.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Orders")}
                    className="self-start"
                  >
                    <View className="bg-amber-600 px-4 py-2 rounded-lg">
                      <Text className="text-white font-semibold text-sm">
                        View Pending Orders →
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ================= QUICK ACTIONS ================= */}
          <View className="mb-10">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* ➕ Add Product */}
              <TouchableOpacity
                onPress={() => navigation.navigate("AddProduct")}
                activeOpacity={0.85}
                className="mr-4"
              >
                <View className="rounded-2xl overflow-hidden shadow-sm">
                  <View className="bg-green-600 px-6 py-4 flex-row items-center">
                    <PlusCircle size={22} color="white" />
                    <Text className="text-white ml-3 font-semibold text-base">
                      Add Product
                    </Text>
                  </View>
                  <View className="h-1 bg-green-400" />
                </View>
              </TouchableOpacity>

              {/* 📦 View Products */}
              <TouchableOpacity
                onPress={() => navigation.navigate("Products")}
                activeOpacity={0.85}
                className="mr-4"
              >
                <View className="rounded-2xl overflow-hidden shadow-sm">
                  <View className="bg-purple-600 px-6 py-4 flex-row items-center">
                    <PlusCircle size={22} color="white" />
                    <Text className="text-white ml-3 font-semibold text-base">
                      My Products
                    </Text>
                  </View>
                  <View className="h-1 bg-purple-400" />
                </View>
              </TouchableOpacity>

              {/* 📦 View All Orders */}
              <TouchableOpacity
                onPress={() => navigation.navigate("Orders")}
                activeOpacity={0.85}
                className="mr-4"
              >
                <View className="rounded-2xl overflow-hidden shadow-sm">
                  <View className="bg-blue-600 px-6 py-4 flex-row items-center">
                    <ShoppingCart size={22} color="white" />
                    <Text className="text-white ml-3 font-semibold text-base">
                      All Orders
                    </Text>
                  </View>
                  <View className="h-1 bg-blue-400" />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ================= NO COMPLETED ORDERS MESSAGE ================= */}
          {stats.completedOrders === 0 && stats.totalProducts > 0 && (
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <Text className="text-blue-800 font-semibold mb-1">
                📊 Getting Started
              </Text>
              <Text className="text-blue-700 text-sm">
                You have products listed! Once buyers place and complete orders, your earnings will appear here.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default FarmerDashboardScreen;