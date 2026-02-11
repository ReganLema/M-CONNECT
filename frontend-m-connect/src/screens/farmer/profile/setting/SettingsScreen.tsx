// src/screens/farmer/SettingsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Bell, Moon, LogOut } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";


const SettingsScreen: React.FC = () => {
  const { logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-6">
      <Text className="text-2xl font-bold mb-6 text-gray-900">
        Settings
      </Text>

      {/* ================= PREFERENCES ================= */}
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <Text className="text-sm font-semibold text-gray-500 mb-3">
          PREFERENCES
        </Text>

        {/* Notifications */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center">
            <Bell size={22} color="#F59E0B" />
            <Text className="ml-3 text-gray-800 font-medium">
              Notifications
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
            thumbColor={notifications ? "#22C55E" : "#9CA3AF"}
          />
        </View>

        <View className="h-px bg-gray-100" />

        {/* Dark Mode */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center">
            <Moon size={22} color="#6B7280" />
            <Text className="ml-3 text-gray-800 font-medium">
              Dark Mode
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
            thumbColor={darkMode ? "#22C55E" : "#9CA3AF"}
          />
        </View>
      </View>

      {/* ================= SECURITY ================= */}
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <Text className="text-sm font-semibold text-gray-500 mb-3">
          SECURITY
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-4"
        >
          <LogOut size={22} color="#EF4444" />
          <Text className="ml-3 text-red-600 font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= APP ================= */}
      <View className="mb-6">
        <Text className="text-sm text-center text-gray-400">
          Mkulima Connect • v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
