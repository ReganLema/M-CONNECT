// App.tsx - Add this at the VERY TOP of the file
import { Platform } from 'react-native';

// Global patch for deprecated SafeAreaView
if (Platform.OS !== 'web') {
  try {
    const ReactNative = require('react-native');
    
    // Override the getter for SafeAreaView
    Object.defineProperty(ReactNative, 'SafeAreaView', {
      get() {
        console.warn('Deprecated SafeAreaView accessed - returning patched version');
        
        // Return a simple View component that won't cause errors
        const PatchedSafeAreaView = ({ children, style, ...props }: any) => {
          const View = ReactNative.View;
          return React.createElement(View, {
            style: [{ flex: 1 }, style],
            ...props
          }, children);
        };
        
        return PatchedSafeAreaView;
      },
      set(value) {
        // Allow setting if needed
        Object.defineProperty(ReactNative, '_SafeAreaView', { value, writable: true });
      },
      configurable: true
    });
  } catch (error) {
    console.log('SafeAreaView patch error:', error);
  }
}




// App.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

import { UserProvider } from "./src/contexts/UserContext";  
import { SettingsProvider } from "@/contexts/SettingsContext";
 import { AuthProvider } from "@/contexts/AuthContext"; // ✅ Import AuthProvider
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