import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "@/screens/profile/settings/SettingsScreen";
import HelpCenterScreen from "@/screens/profile/settings/HelpCenterScreen";
import SettingsStack from "./SettingsStack";


export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  MyOrders: undefined;
  Settings: undefined;
  HelpCenter: undefined;
  
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      {/* Optional future screens */}
      {/* <Stack.Screen name="MyOrders" component={MyOrdersScreen} /> */}
       <Stack.Screen name="Settings" component={SettingsStack} /> 
       <Stack.Screen name="HelpCenter" component={HelpCenterScreen} /> 
        
    </Stack.Navigator>
  );
}
