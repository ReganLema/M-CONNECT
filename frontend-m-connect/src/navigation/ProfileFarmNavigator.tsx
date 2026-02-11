// src/navigation/ProfileFarmNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FarmerProfileScreen from "@/screens/farmer/profile/ProfileScreen";
import EditFarmerProfileScreen from "@/screens/farmer/profile/EditProfileScreen";
import EarningsScreen from "@/screens/farmer/profile/EarningsScreen";
import AnalyticsScreen from "@/screens/farmer/profile/AnalyticsScreen";
import VerificationScreen from "@/screens/farmer/profile/VerificationScreen";
import SettingsScreen from "@/screens/farmer/profile/setting/SettingsScreen";

export type ProfileFarmStackParamList = {
  FarmerProfile: undefined;
  EditFarmerProfile: undefined;
  Earnings: undefined;
  Analytics: undefined;
  Verification: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileFarmStackParamList>();

const ProfileFarmNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
      }}
    >
      {/* 👤 Farmer Profile */}
      <Stack.Screen
        name="FarmerProfile"
        component={FarmerProfileScreen}
        options={{ title: "My Farm" }}
      />

      {/* ✏️ Edit Profile */}
      <Stack.Screen
        name="EditFarmerProfile"
        component={EditFarmerProfileScreen}
        options={{ title: "Edit Profile" }}
      />

      {/* 💰 Earnings */}
      <Stack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: "Earnings" }}
      />

      {/* 📊 Analytics */}
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />

      {/* 🔐 Verification */}
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{ title: "Verification" }}
      />

      {/* ⚙️ Settings */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
};

export default ProfileFarmNavigator;
