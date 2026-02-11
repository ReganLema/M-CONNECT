// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, ChevronRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { registerForPushNotifications } from '@/services/notificationService';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.email.trim()) return "Email address is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleLogin = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setLoading(true);
    try {
      const response = await login(form.email, form.password);
      console.log("LOGIN RESPONSE:", response);

      if (response.status === "success") {
        // Navigate to app home (AuthProvider state should handle)
      } else {
        Alert.alert("Login Failed", response.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);
      Alert.alert("Login Failed", err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-12 pb-8">
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-emerald-100 rounded-2xl items-center justify-center mb-6">
                <Text className="text-3xl font-bold text-emerald-600">🌱</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
              <Text className="text-gray-500 text-center text-base">
                Sign in to continue to Mkulima Connect
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
              {/* Email */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Mail size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="you@example.com"
                    value={form.email}
                    onChangeText={(v) => setForm({ ...form, email: v })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-200 rounded-xl pl-12 pr-4 py-4 bg-gray-50 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Lock size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(v) => setForm({ ...form, password: v })}
                    className="border border-gray-200 rounded-xl pl-12 pr-12 py-4 bg-gray-50 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`bg-emerald-600 rounded-xl py-4 flex-row items-center justify-center ${
                  loading ? "opacity-70" : ""
                }`}
              >
                {loading ? (
                  <Text className="text-white font-semibold">Signing In...</Text>
                ) : (
                  <>
                    <Text className="text-white font-semibold mr-2">Sign In</Text>
                    <ChevronRight size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              {/* Register */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500 mr-1">Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text className="text-emerald-600 font-semibold">Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
