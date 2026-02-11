// src/screens/agribusiness/MarketTrendsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Import the LoginPromptModal and useAuth hook
import LoginPromptModal from "@/components/LoginPromptModal";
import { useAuth } from "@/contexts/AuthContext";

export default function MarketTrendsScreen({ navigation }: any) {
  const { user } = useAuth(); // Get user from auth context
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  const trendingProducts = [
    {
      rank: 1,
      name: "Organic Tomatoes",
      demand: "40%",
      price: "High",
      icon: "🍅"
    },
    {
      rank: 2,
      name: "Leafy Greens",
      demand: "35%",
      price: "Medium-High",
      icon: "🥬"
    },
    {
      rank: 3,
      name: "Avocados",
      demand: "50%",
      price: "Very High",
      icon: "🥑"
    },
    {
      rank: 4,
      name: "Bell Peppers",
      demand: "30%",
      price: "High",
      icon: "🫑"
    },
    {
      rank: 5,
      name: "Fresh Herbs",
      demand: "45%",
      price: "Premium",
      icon: "🌿"
    },
  ];

  const hotReasons = [
    {
      icon: "arrow-up-circle",
      title: "Urban Expansion",
      description: "More city buyers = higher demand",
      color: "#10B981"
    },
    {
      icon: "fitness",
      title: "Health Trends",
      description: "Organic preference growing rapidly",
      color: "#3B82F6"
    },
    {
      icon: "restaurant",
      title: "Restaurants Growth",
      description: "Bulk orders from food industry",
      color: "#F59E0B"
    },
    {
      icon: "globe",
      title: "Export Opportunities",
      description: "International markets paying premium",
      color: "#8B5CF6"
    },
  ];

  const bestCategories = [
    {
      category: "Vegetables",
      risk: "Low",
      returns: "Quick",
      description: "Fast growth, consistent demand, low investment"
    },
    {
      category: "Fruits",
      risk: "Medium",
      returns: "High Margin",
      description: "Premium pricing, seasonal advantage"
    },
    {
      category: "Herbs & Spices",
      risk: "Low",
      returns: "Premium",
      description: "High value, small space needed"
    },
  ];

  // Handle Explore Market button press with auth check
  const handleExploreMarket = () => {
    if (!user) {
      // Show login prompt if not authenticated
      setLoginPromptVisible(true);
    } else {
      // Navigate directly to market if authenticated
      navigation.navigate("BuyerTabs", { screen: "Market" });
    }
  };

  // Auth navigation handlers
  const handleLogin = () => {
    setLoginPromptVisible(false);
    navigation.getParent()?.navigate("Auth", { screen: "Login" });
  };

  const handleRegister = () => {
    setLoginPromptVisible(false);
    navigation.getParent()?.navigate("Auth", { screen: "Register" });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-yellow-500 px-6 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">
          Market Trends & Opportunities
        </Text>
        <Text className="text-yellow-100 text-base mt-2">
          What's hot in agribusiness right now
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top Trending Products */}
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            📈 Top Trending Products
          </Text>
          {trendingProducts.map((product, index) => (
            <View
              key={index}
              className="bg-yellow-50 rounded-2xl p-5 mb-4 border border-yellow-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-yellow-500 items-center justify-center mr-4">
                    <Text className="text-white font-bold text-lg">
                      #{product.rank}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-2xl mr-2">{product.icon}</Text>
                      <Text className="text-lg font-bold text-gray-900">
                        {product.name}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm">
                      Price Level: {product.price}
                    </Text>
                  </View>
                </View>
                <View className="bg-yellow-500 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold">
                    ⬆️ {product.demand}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Why These Are Hot */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Why These Are Hot Right Now
          </Text>
          {hotReasons.map((reason, index) => (
            <View
              key={index}
              className="bg-gray-50 rounded-2xl p-5 mb-4"
            >
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: reason.color + "20" }}
                >
                  <Ionicons 
                    name={reason.icon as any} 
                    size={24} 
                    color={reason.color} 
                  />
                </View>
                <Text className="text-lg font-bold text-gray-900 flex-1">
                  {reason.title}
                </Text>
              </View>
              <Text className="text-gray-600 pl-16">
                {reason.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Best Categories */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            💎 Best Categories to Enter
          </Text>
          {bestCategories.map((cat, index) => (
            <View
              key={index}
              className="bg-emerald-50 rounded-2xl p-5 mb-4 border border-emerald-100"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-gray-900">
                  ✓ {cat.category}
                </Text>
                <View className="flex-row gap-2">
                  <View className="bg-emerald-100 px-3 py-1 rounded-full">
                    <Text className="text-emerald-700 text-xs font-bold">
                      {cat.risk} Risk
                    </Text>
                  </View>
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">
                      {cat.returns}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-gray-600">
                {cat.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Call to Action */}
        <View className="px-6">
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6"
          >
            <Text className="text-white font-bold text-xl mb-2">
              Start with Trending Products
            </Text>
            <Text className="text-yellow-100 text-sm mb-5">
              Browse 500+ products from verified farmers
            </Text>
            <TouchableOpacity 
              className="bg-white rounded-xl py-4"
              activeOpacity={0.8}
              onPress={handleExploreMarket}
            >
              <Text className="text-yellow-600 font-bold text-center text-base">
                Explore Market
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={loginPromptVisible}
        onClose={() => setLoginPromptVisible(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </SafeAreaView>
  );
}