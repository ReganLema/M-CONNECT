import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../../../contexts/SettingsContext";
import { RootStackParamList } from "../../../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Nav = NativeStackNavigationProp<RootStackParamList>;


export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();

  const { darkMode, notifications, locationAccess, setSettings } = useSettings();

  const [localSettings, setLocalSettings] = useState({
    darkMode,
    notifications,
    locationAccess,
  });

  const saveSettings = () => {
    setSettings(localSettings);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100 px-5"
      contentContainerStyle={{ paddingVertical: 25 }}
    >
      {/* Header */}
      <Text className="text-3xl font-bold text-green-700 mb-8">
        Settings
      </Text>

      {/* Preferences */}
      <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Preferences
        </Text>

        <SettingToggle
          label="Dark Mode"
          value={localSettings.darkMode}
          onChange={(v) => setLocalSettings({ ...localSettings, darkMode: v })}
        />

        <SettingToggle
          label="Push Notifications"
          value={localSettings.notifications}
          onChange={(v) =>
            setLocalSettings({ ...localSettings, notifications: v })
          }
        />

        <SettingToggle
          label="Location Access"
          value={localSettings.locationAccess}
          onChange={(v) =>
            setLocalSettings({ ...localSettings, locationAccess: v })
          }
          isLast
        />
      </View>

      {/* Account */}
      <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Account
        </Text>

        <SettingItem
          label="Edit Profile"
          icon="person-circle-outline"
          onPress={() => navigation.navigate("EditProfile")}
        />

        <SettingItem
          label="Change Password"
          icon="key-outline"
          onPress={() => navigation.navigate("ChangePassword")}
        />

        <SettingItem
          label="Language"
          icon="globe-outline"
          onPress={() => navigation.navigate("Language")}
          isLast
        />
      </View>

      {/* Support */}
      <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Support
        </Text>

        <SettingItem
          label="Help Center"
          icon="help-circle-outline"
          onPress={() => navigation.navigate("HelpCenter")}
        />

        <SettingItem
          label="Privacy Policy"
          icon="document-text-outline"
          onPress={() => navigation.navigate("Privacy")}
          isLast
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity activeOpacity={0.8} onPress={saveSettings}>
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={[0, 0]}
          end={[1, 0]}
          className="py-4 rounded-2xl shadow-lg"
        >
          <Text className="text-center text-white text-lg font-bold">
            Save Settings
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* Toggle Component */
const SettingToggle = ({
  label,
  value,
  onChange,
  isLast,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row justify-between items-center py-4 ${
      !isLast ? "border-b border-gray-200" : ""
    }`}
  >
    <Text className="text-gray-700 text-base">{label}</Text>
    <Switch
      trackColor={{ false: "#d1d5db", true: "#10B981" }}
      thumbColor={value ? "#ffffff" : "#f4f3f4"}
      onValueChange={onChange}
      value={value}
    />
  </View>
);

/* Item Component */
const SettingItem = ({
  label,
  icon,
  onPress,
  isLast,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row justify-between items-center py-4 ${
      !isLast ? "border-b border-gray-200" : ""
    }`}
  >
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={24} color="#059669" />
      <Text className="text-gray-700 text-base">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
  </TouchableOpacity>
);
