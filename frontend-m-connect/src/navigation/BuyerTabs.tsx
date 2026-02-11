//BuyerTabs.tsx


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import HomeScreen from '../screens/public/HomeScreen';
import MarketListScreen from '../screens/market/MarketListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyOrders from '../screens/orders/OrdersScreen';


const Tab = createBottomTabNavigator();

export default function BuyerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketListScreen} />
      <Tab.Screen name="Orders" component={MyOrders} />
      <Tab.Screen name="Profiles" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
