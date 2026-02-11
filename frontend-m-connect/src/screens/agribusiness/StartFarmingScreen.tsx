// src/screens/agribusiness/StartFarmingScreen.tsx

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

export default function StartFarmingScreen({ navigation }: any) {
  const { user } = useAuth(); // Get user from auth context
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  const sections = [
    {
      title: "🌟 High-Profit Crops (2026)",
      items: [
        {
          name: "Tomatoes",
          description: "High demand, year-round production",
          profit: "High",
          season: "Year-round"
        },
        {
          name: "Leafy Greens",
          description: "Quick turnover, consistent profit",
          profit: "Medium-High",
          season: "Year-round"
        },
        {
          name: "Avocados",
          description: "Premium pricing, growing export demand",
          profit: "Very High",
          season: "Seasonal"
        },
        {
          name: "Bell Peppers",
          description: "Urban market favorite, high value",
          profit: "High",
          season: "Year-round"
        },
      ]
    },
    {
      title: "💰 Starting Capital Requirements",
      items: [
        {
          scale: "Small Scale",
          capital: "500,000 - 2,000,000 TZS",
          land: "0.5 - 2 acres",
          description: "Perfect for beginners, manageable risk"
        },
        {
          scale: "Medium Scale",
          capital: "5,000,000 - 15,000,000 TZS",
          land: "3 - 10 acres",
          description: "Established farmers, diversified crops"
        },
        {
          scale: "Large Scale",
          capital: "20,000,000+ TZS",
          land: "10+ acres",
          description: "Commercial farming, multiple markets"
        },
      ]
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Research Your Market",
      description: "Understand local demand, prices, and competition in your area",
      icon: "search"
    },
    {
      step: "2",
      title: "Start Small",
      description: "Begin with 1-2 crops to minimize risk and learn the business",
      icon: "leaf"
    },
    {
      step: "3",
      title: "Join Cooperatives",
      description: "Connect with other farmers for shared resources and knowledge",
      icon: "people"
    },
    {
      step: "4",
      title: "Modern Techniques",
      description: "Learn drip irrigation, greenhouse farming, and organic methods",
      icon: "school"
    },
    {
      step: "5",
      title: "Build Relationships",
      description: "Network with buyers, suppliers, and agricultural officers",
      icon: "handshake"
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
      <View className="bg-emerald-500 px-6 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">
          Starting Your Farming Journey
        </Text>
        <Text className="text-emerald-100 text-base mt-2">
          Complete guide for aspiring farmers
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* High-Profit Crops */}
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            {sections[0].title}
          </Text>
          {sections[0].items.map((crop: any, index) => (
            <View
              key={index}
              className="bg-emerald-50 rounded-2xl p-5 mb-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-bold text-gray-900 flex-1">
                  {crop.name}
                </Text>
                <View className="bg-emerald-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {crop.profit}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600 mb-2">{crop.description}</Text>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={14} color="#059669" />
                <Text className="text-emerald-600 text-sm ml-1 font-medium">
                  {crop.season}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Capital Requirements */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            {sections[1].title}
          </Text>
          {sections[1].items.map((scale: any, index) => (
            <View
              key={index}
              className="bg-blue-50 rounded-2xl p-5 mb-4 border border-blue-100"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                  <Ionicons name="trending-up" size={20} color="white" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  {scale.scale}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-3 mb-2">
                <Text className="text-gray-600 text-sm mb-1">Capital Range</Text>
                <Text className="text-blue-600 font-bold text-lg">
                  {scale.capital}
                </Text>
              </View>
              <Text className="text-gray-600 mb-1">
                📍 Land: {scale.land}
              </Text>
              <Text className="text-gray-500 text-sm italic">
                {scale.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Getting Started Steps */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            📚 Step-by-Step Guide
          </Text>
          {steps.map((step, index) => (
            <View
              key={index}
              className="flex-row mb-4"
            >
              <View className="items-center mr-4">
                <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {step.step}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View className="w-0.5 flex-1 bg-emerald-200 mt-2" />
                )}
              </View>
              <View className="flex-1 pb-4">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {step.title}
                </Text>
                <Text className="text-gray-600 leading-relaxed">
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Call to Action */}
        <View className="px-6">
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6"
          >
            <Text className="text-white font-bold text-xl mb-2">
              Ready to Start Farming?
            </Text>
            <Text className="text-emerald-100 text-sm mb-5">
              Join 200+ successful farmers on Mkulima Connect
            </Text>
            <TouchableOpacity 
              className="bg-white rounded-xl py-4"
              activeOpacity={0.8}
              onPress={handleExploreMarket}
            >
              <Text className="text-emerald-600 font-bold text-center text-base">
                Explore Market Now
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