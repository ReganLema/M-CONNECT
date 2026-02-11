// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/common/Loader";

/* ----------- NAVIGATORS ----------- */
import PublicNavigator from "./PublicNavigator";
import BuyerTabsNavigator from "./BuyerTabsNavigator";
import FarmerTabsNavigator from "./FarmerTabsNavigator";
import AuthNavigator from "./AuthNavigator";

/* ----------- SCREENS ----------- */
import ProductDetailsScreen from "@/screens/orders/ProductDetailsScreen";
import OrderDetailsScreen from "@/screens/orders/OrderDetailsScreen";
import CartScreen from "@/screens/orders/CartScreen";
import RoleSwitchScreen from "@/screens/dev/RoleSwitchScreen";
import AddProductScreen from "@/screens/farmer/AddProductScreen";
import EditProductScreen from "@/screens/farmer/EditProductScreen";
import SellerOrderDetailsScreen from "@/screens/farmer/SellerOrderDetailsScreen";
import AboutScreen from "@/screens/public/AboutScreen";
import StartFarmingScreen from "@/screens/agribusiness/StartFarmingScreen";
import MarketTrendsScreen from "@/screens/agribusiness/MarketTrendsScreen";
import StartBusinessScreen from "@/screens/agribusiness/StartBusinessScreen";


/* ----------- TYPES ----------- */
export type RootStackParamList = {
  Public: undefined;
  Auth: undefined;
  BuyerTabs: undefined;
  FarmerTabs: undefined;

  
  OrderDetails: { orderId: string };
  Cart: undefined;
  RoleSwitch: undefined;
  AddProduct: undefined;
  EditProduct: { product: any };
  SellerOrderDetails: { orderId: string };
  ProductDetails: {product: any;

};

 About: undefined; 
  StartFarming: undefined;
  StartBusiness: undefined;
  MarketTrends: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // ---------- SHOW LOADER WHILE AUTH STATE IS LOADING ----------
  if (loading) {
    return <Loader />;
  }

  // ---------- DETERMINE INITIAL ROUTE ----------
  const initialRouteName: keyof RootStackParamList =
    user?.role === "buyer"
      ? "BuyerTabs"
      : user?.role === "farmer"
      ? "FarmerTabs"
      : "Public";

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        {/* ---------- PUBLIC SCREENS ---------- */}
        {!user && (
          <>
            <Stack.Screen name="Public" component={PublicNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}

        {/* ---------- AUTHENTICATED SCREENS ---------- */}
        {user && user.role === "buyer" && (
          <Stack.Screen
            name="BuyerTabs"
            component={BuyerTabsNavigator}
            options={{ gestureEnabled: false }}
          />
        )}

        {user && user.role === "farmer" && (
          <Stack.Screen
            name="FarmerTabs"
            component={FarmerTabsNavigator}
            options={{ gestureEnabled: false }}
          />
        )}

        {/* ---------- SHARED SCREENS ---------- */}
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
        />

        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
        />

        <Stack.Screen
          name="RoleSwitch"
          component={RoleSwitchScreen}
        />

        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
        />

        <Stack.Screen
          name="EditProduct"
          component={EditProductScreen}
        />

        <Stack.Screen
          name="SellerOrderDetails"
          component={SellerOrderDetailsScreen}
        />

        <Stack.Screen 
          name="About" 
          component={AboutScreen} 
          options={{ title: 'About Us' }}
        />

        
        <Stack.Screen name="StartFarming" component={StartFarmingScreen} />
        <Stack.Screen name="StartBusiness" component={StartBusinessScreen} />
        <Stack.Screen name="MarketTrends" component={MarketTrendsScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
