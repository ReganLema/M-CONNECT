// src/screens/agribusiness/StartBusinessScreen.tsx

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

export default function StartBusinessScreen({ navigation }: any) {
  const { user } = useAuth(); // Get user from auth context
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  const demandProducts = [
    {
      name: "Organic Vegetables",
      growth: "35%",
      reason: "Health-conscious urban consumers",
      icon: "leaf"
    },
    {
      name: "Fresh Fruits",
      growth: "30%",
      reason: "Year-round demand in cities",
      icon: "nutrition"
    },
    {
      name: "Dairy Products",
      growth: "25%",
      reason: "Urban population expansion",
      icon: "water"
    },
    {
      name: "Processed Foods",
      growth: "40%",
      reason: "Value addition opportunities",
      icon: "cube"
    },
  ];

  const reasons = [
    {
      icon: "people",
      title: "Growing Urban Population",
      description: "Cities expanding, more buyers needed"
    },
    {
      icon: "fitness",
      title: "Health Consciousness Rising",
      description: "Demand for organic & fresh produce"
    },
    {
      icon: "warning",
      title: "Limited Local Supply",
      description: "Supply gap creates opportunity"
    },
    {
      icon: "time",
      title: "Year-Round Consumption",
      description: "Consistent demand throughout year"
    },
  ];

  const investments = [
    {
      type: "Distribution Business",
      capital: "3M - 10M TZS",
      items: ["Transport vehicle", "Cold storage", "Working capital"],
      returns: "15-25% annual ROI"
    },
    {
      type: "Processing Business",
      capital: "10M - 50M TZS",
      items: ["Processing equipment", "Packaging materials", "Facility"],
      returns: "20-35% annual ROI"
    },
    {
      type: "Retail Business",
      capital: "2M - 8M TZS",
      items: ["Store setup", "Display units", "Initial stock"],
      returns: "20-30% annual ROI"
    },
  ];

  // Handle Find Suppliers button press with auth check
  const handleFindSuppliers = () => {
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
      <View className="bg-blue-500 px-6 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">
          Start Your Agribusiness
        </Text>
        <Text className="text-blue-100 text-base mt-2">
          Guide for aspiring entrepreneurs
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* High-Demand Products */}
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            🔥 High-Demand Products Now
          </Text>
          {demandProducts.map((product, index) => (
            <View
              key={index}
              className="bg-blue-50 rounded-2xl p-5 mb-4 border border-blue-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {product.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {product.reason}
                  </Text>
                </View>
                <View className="bg-blue-500 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold">
                    ⬆️ {product.growth}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Why High Demand */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            💡 Why These Are in High Demand
          </Text>
          {reasons.map((reason, index) => (
            <View
              key={index}
              className="flex-row items-start mb-4 bg-gray-50 rounded-2xl p-4"
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Ionicons name={reason.icon as any} size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  {reason.title}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {reason.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Investment Requirements */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            💰 Initial Investment Breakdown
          </Text>
          {investments.map((inv, index) => (
            <View
              key={index}
              className="bg-yellow-50 rounded-2xl p-5 mb-4 border border-yellow-100"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  {inv.type}
                </Text>
                <View className="bg-yellow-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {inv.returns}
                  </Text>
                </View>
              </View>
              <View className="bg-white rounded-xl p-3 mb-3">
                <Text className="text-yellow-600 font-bold text-xl">
                  {inv.capital}
                </Text>
              </View>
              <Text className="text-gray-700 font-semibold mb-2">
                Key Requirements:
              </Text>
              {inv.items.map((item, idx) => (
                <Text key={idx} className="text-gray-600 text-sm mb-1">
                  • {item}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Call to Action */}
        <View className="px-6">
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6"
          >
            <Text className="text-white font-bold text-xl mb-2">
              Ready to Start Your Business?
            </Text>
            <Text className="text-blue-100 text-sm mb-5">
              Connect with 200+ farmers and explore opportunities
            </Text>
            <TouchableOpacity 
              className="bg-white rounded-xl py-4"
              activeOpacity={0.8}
              onPress={handleFindSuppliers}
            >
              <Text className="text-blue-600 font-bold text-center text-base">
                Find Suppliers Now
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