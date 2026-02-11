



// App.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

import { UserProvider } from "./src/contexts/UserContext";  
import { SettingsProvider } from "@/contexts/SettingsContext";
 import { AuthProvider } from "@/contexts/AuthContext"; 
import AppNavigator from "./src/navigation/AppNavigator";
import { useNotifications } from "@/hooks/useNotifications";



export default function App() {

  //useNotifications();
  return (
    <SettingsProvider>
      <UserProvider>   
        {/* Use proper JSX component syntax */}
        <AuthProvider> 
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <AppNavigator /> {/* Uses AuthContext to decide which stack */}
              <StatusBar style="auto" />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </UserProvider>
    </SettingsProvider>
  );
}