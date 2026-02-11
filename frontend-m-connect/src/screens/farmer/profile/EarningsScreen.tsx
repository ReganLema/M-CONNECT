// src/screens/farmer/EarningsScreen.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Wallet,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  CheckCircle,
  DollarSign,
  Download,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getFarmerOrders, FarmerOrder } from "@/services/farmerOrderService";
import api from "@/services/api";

type EarningsData = {
  totalEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  completedOrders: FarmerOrder[];
  percentageChange: number;
};

const EarningsScreen: React.FC = () => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch earnings from backend endpoint
  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/farmer/earnings');
      
      if (response.data.success) {
        setEarningsData({
          totalEarnings: response.data.earnings.total,
          thisMonthEarnings: response.data.earnings.this_month,
          lastMonthEarnings: response.data.earnings.last_month,
          completedOrders: response.data.recent_orders,
          percentageChange: response.data.earnings.percentage_change,
        });
        
        console.log('💰 Earnings loaded:', {
          total: response.data.earnings.total,
          thisMonth: response.data.earnings.this_month,
          orders: response.data.recent_orders.length,
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching earnings:', error);
      Alert.alert('Error', 'Failed to load earnings data');
      
      setEarningsData({
        totalEarnings: 0,
        thisMonthEarnings: 0,
        lastMonthEarnings: 0,
        completedOrders: [],
        percentageChange: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchEarningsData();
    }, [])
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarningsData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
        <Text className="text-gray-500 mt-4">Loading earnings...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* ================= HEADER ================= */}
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
          <TouchableOpacity 
            onPress={fetchEarningsData}
            className="bg-emerald-100 px-4 py-2 rounded-full"
          >
            <Text className="text-emerald-700 text-sm font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= TOTAL EARNINGS CARD ================= */}
      <View className="px-5 mb-6">
        <View 
          className="rounded-3xl p-6 shadow-lg"
          style={{ backgroundColor: '#10B981' }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-emerald-100 text-sm font-medium mb-2">
                Total Earnings
              </Text>
              <Text className="text-white text-4xl font-bold mb-1">
                {(earningsData?.totalEarnings || 0).toLocaleString()}
              </Text>
              <Text className="text-white text-lg font-semibold opacity-90">
                TZS
              </Text>
            </View>

            {/* Icon */}
            <View className="bg-white/20 rounded-full p-3">
              <DollarSign size={28} color="white" />
            </View>
          </View>

          {/* Completed Orders Count */}
          <View className="bg-white/20 rounded-xl px-3 py-2 mb-4">
            <Text className="text-white text-xs">
              From {earningsData?.completedOrders.length || 0} completed order{earningsData?.completedOrders.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Percentage Change */}
          {earningsData && earningsData.percentageChange !== 0 && (
            <View className="flex-row items-center">
              <View 
                className="rounded-full px-2 py-1 flex-row items-center mr-2"
                style={{ 
                  backgroundColor: earningsData.percentageChange >= 0 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(239, 68, 68, 0.3)' 
                }}
              >
                <TrendingUp 
                  size={12} 
                  color="white"
                  style={{
                    transform: [{ 
                      rotate: earningsData.percentageChange >= 0 ? '0deg' : '180deg' 
                    }]
                  }}
                />
                <Text className="text-white text-xs font-bold ml-1">
                  {Math.abs(earningsData.percentageChange).toFixed(1)}%
                </Text>
              </View>
              <Text className="text-white text-xs flex-1">
                vs last month
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ================= MONTHLY STATS ================= */}
      <View className="px-5 mb-6">
        <View className="flex-row gap-3">
          {/* This Month */}
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <View className="bg-emerald-100 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Wallet size={22} color="#10B981" />
            </View>
            <Text className="text-gray-500 text-xs font-medium mb-1">
              This Month
            </Text>
            <Text className="text-gray-900 text-lg font-bold">
              {(earningsData?.thisMonthEarnings || 0).toLocaleString()}
            </Text>
            <Text className="text-gray-500 text-xs mt-0.5">TZS</Text>
          </View>

          {/* Last Month */}
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Calendar size={22} color="#3B82F6" />
            </View>
            <Text className="text-gray-500 text-xs font-medium mb-1">
              Last Month
            </Text>
            <Text className="text-gray-900 text-lg font-bold">
              {(earningsData?.lastMonthEarnings || 0).toLocaleString()}
            </Text>
            <Text className="text-gray-500 text-xs mt-0.5">TZS</Text>
          </View>
        </View>
      </View>

      {/* ================= RECENT EARNINGS HEADER ================= */}
      <View className="px-5 mb-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">
            Recent Earnings
          </Text>
          <View className="bg-emerald-100 px-3 py-1.5 rounded-full">
            <Text className="text-emerald-700 text-xs font-bold">
              {earningsData?.completedOrders.length || 0} Completed
            </Text>
          </View>
        </View>
      </View>

      {/* ================= COMPLETED ORDERS LIST ================= */}
      <View className="px-5">
        {earningsData?.completedOrders.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center mb-6">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <DollarSign size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              No Earnings Yet
            </Text>
            <Text className="text-gray-500 text-center text-sm">
              Your completed orders will appear here
            </Text>
          </View>
        ) : (
          <>
            {earningsData?.completedOrders.slice(0, 10).map((order, index) => (
              <View 
                key={order.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start">
                  {/* Left Side - Order Info */}
                  <View className="flex-1 mr-4">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-emerald-100 rounded-full p-1 mr-2">
                        <CheckCircle size={14} color="#10B981" />
                      </View>
                      <Text className="font-bold text-gray-900 text-base">
                        Order #{order.id}
                      </Text>
                    </View>
                    
                    <Text className="text-gray-700 text-sm font-medium mb-1">
                      {order.buyer_name}
                    </Text>
                    
                    <Text className="text-gray-400 text-xs mb-1">
                      {formatDate(order.created_at)}
                    </Text>
                    
                    <View className="bg-gray-100 rounded-full px-2 py-1 self-start mt-1">
                      <Text className="text-gray-600 text-xs font-medium">
                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Right Side - Amount */}
                  <View className="items-end justify-center">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-emerald-600 font-bold text-xl">
                        +{order.total_amount.toLocaleString()}
                      </Text>
                      <ArrowUpRight size={18} color="#10B981" style={{ marginLeft: 4 }} />
                    </View>
                    <Text className="text-gray-400 text-xs font-medium">
                      TZS
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            
            {/* Show More Indicator */}
            {earningsData && earningsData.completedOrders.length > 10 && (
              <View className="items-center py-4">
                <Text className="text-gray-500 text-sm">
                  Showing 10 of {earningsData.completedOrders.length} completed orders
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* ================= WITHDRAW BUTTON ================= */}
      <View className="px-5 pt-2 pb-10">
        <TouchableOpacity 
          className="bg-gray-900 py-4 rounded-2xl items-center flex-row justify-center shadow-lg"
          activeOpacity={0.8}
          onPress={() => Alert.alert(
            'Coming Soon',
            'Withdrawal feature will be available soon!'
          )}
        >
          <Download size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-lg">
            Withdraw Earnings
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EarningsScreen;