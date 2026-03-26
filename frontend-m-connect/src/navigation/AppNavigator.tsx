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
import AddProductScreen from "@/screens/farmer/AddProductScreen";
import EditProductScreen from "@/screens/farmer/EditProductScreen";
import SellerOrderDetailsScreen from "@/screens/farmer/SellerOrderDetailsScreen";
import AboutScreen from "@/screens/public/AboutScreen";
import StartFarmingScreen from "@/screens/agribusiness/StartFarmingScreen";
import MarketTrendsScreen from "@/screens/agribusiness/MarketTrendsScreen";
import StartBusinessScreen from "@/screens/agribusiness/StartBusinessScreen";

export type RootStackParamList = {
  Public: undefined;
  Auth: undefined;
  BuyerTabs: undefined;
  FarmerTabs: undefined;
  OrderDetails: { orderId: string };
  Cart: undefined;
  AddProduct: undefined;
  EditProduct: { product: any };
  SellerOrderDetails: { orderId: string };
  ProductDetails: { product: any };
  About: undefined; 
  StartFarming: undefined;
  StartBusiness: undefined;
  MarketTrends: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  console.log("🔍 AppNavigator render:", {
    hasUser: !!user,
    isVerified: user?.email_verified,
    role: user?.role
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {/* Show Auth/Public when NOT logged in OR not verified */}
        {(!user || !user.email_verified) ? (
          <>
            <Stack.Screen name="Public" component={PublicNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            {/* Show main app when logged in AND verified */}
            {user.role === "buyer" && (
              <Stack.Screen name="BuyerTabs" component={BuyerTabsNavigator} />
            )}
            
            {user.role === "farmer" && (
              <Stack.Screen name="FarmerTabs" component={FarmerTabsNavigator} />
            )}
          </>
        )}

        {/* Shared screens - always available */}
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
        <Stack.Screen name="SellerOrderDetails" component={SellerOrderDetailsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="StartFarming" component={StartFarmingScreen} />
        <Stack.Screen name="StartBusiness" component={StartBusinessScreen} />
        <Stack.Screen name="MarketTrends" component={MarketTrendsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}