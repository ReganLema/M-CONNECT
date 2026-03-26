// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import OtpVerificationScreen from '@/screens/auth/OtpVerificationScreen';
import { useAuth } from '@/contexts/AuthContext';
import ResetOtpVerificationScreen from '@/screens/auth/ResetOtpVerificationScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string };
   ForgotPassword: undefined;
  ResetOtpVerification: { email: string };
  ResetPassword: { email: string; resetToken: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const { pendingVerificationEmail } = useAuth();
  
  console.log("🔍 AuthNavigator rendering - pendingVerificationEmail:", pendingVerificationEmail);
  
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={pendingVerificationEmail ? "OtpVerification" : "Login"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
       <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetOtpVerification" component={ResetOtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen 
        name="OtpVerification" 
        component={OtpVerificationScreen}
        //Pass the email from context as initial params
        initialParams={{ email: pendingVerificationEmail || '' }}
        options={{ 
          gestureEnabled: false,
          headerLeft: () => null
        }}
      />
    </Stack.Navigator>
  );
}