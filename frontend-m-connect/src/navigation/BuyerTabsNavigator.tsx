// navigation/BuyerTabsNavigator.tsx

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Home, Store, ShoppingBag, User } from "lucide-react-native";

import HomeScreen from "../screens/public/HomeScreen";
import MarketListScreen from "../screens/market/MarketListScreen";
import MyOrders from "../screens/orders/OrdersScreen";
import ProfileNavigator from "./ProfileNavigator";

const Tab = createBottomTabNavigator();

export default function BuyerTabsNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#22C55E",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
            borderTopWidth: 0,
            elevation: 8,
          },
          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
              case "home":
                return <Home size={size ?? 22} color={color} />;
              case "Market":
                return <Store size={size ?? 22} color={color} />;
              case "Orders":
                return <ShoppingBag size={size ?? 22} color={color} />;
              case "Profile":
                return <User size={size ?? 22} color={color} />;
              default:
                return null;
            }
          },
        })}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />

        <Tab.Screen
          name="Market"
          component={MarketListScreen}
          options={{ title: "Market" }}
        />

        <Tab.Screen
          name="Orders"
          component={MyOrders}
          options={{ title: "Orders" }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
