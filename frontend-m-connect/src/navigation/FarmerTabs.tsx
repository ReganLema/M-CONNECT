import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FarmerDashboardScreen from "../screens/farmer/DashboardScreen";
import FarmerProductsScreen from "../screens/farmer/ProductsScreen";
import FarmerOrdersScreen from "../screens/farmer/OrdersScreen";
import FarmerEarningsScreen from "../screens/farmer/EarningsScreen";
import FarmerProfileScreen from "../screens/farmer/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function FarmerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        component={FarmerDashboardScreen}
      />
      <Tab.Screen
        name="Products"
        component={FarmerProductsScreen}
      />
      <Tab.Screen
        name="Orders"
        component={FarmerOrdersScreen}
      />
      <Tab.Screen
        name="Earnings"
        component={FarmerEarningsScreen}
      />
      <Tab.Screen
        name="Profile"
        component={FarmerProfileScreen}
      />
    </Tab.Navigator>
  );
}
