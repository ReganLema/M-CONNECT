import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Package, ShoppingCart, User } from "lucide-react-native";

import FarmerDashboardScreen from "@/screens/farmer/DashboardScreen";
import FarmerOrdersScreen from "@/screens/farmer/OrdersScreen";
import FarmerProductsScreen from "@/screens/farmer/ProductsScreen";
import ProfileFarmNavigator from "./ProfileFarmNavigator";

const Tab = createBottomTabNavigator();

export default function FarmerTabsNavigator() {
  const insets = useSafeAreaInsets(); // ✅ IMPORTANT

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          height: 64 + insets.bottom, // ✅ SAFE AREA FIX
          paddingBottom: insets.bottom,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
      }}
    >
      {/* 🏠 Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={FarmerDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size ?? 22} />
          ),
        }}
      />

      {/* 📦 Products */}
      <Tab.Screen
        name="Products"
        component={FarmerProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={size ?? 22} />
          ),
        }}
      />

      {/* 🛒 Orders */}
      <Tab.Screen
        name="Orders"
        component={FarmerOrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart color={color} size={size ?? 22} />
          ),
        }}
      />

      {/* 👤 Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileFarmNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size ?? 22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
