// src/screens/auth/LoginScreen.tsx
import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, ChevronRight, ArrowLeft, Leaf } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, clearPendingVerification, pendingVerificationEmail } = useAuth();
  const isFocused = useIsFocused();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Clear any pending verification email when login screen is focused
  useEffect(() => {
    const clearPending = async () => {
      if (isFocused && pendingVerificationEmail) {
        console.log("🔍 Clearing pending verification email on login screen");
        await clearPendingVerification();
      }
    };
    
    clearPending();
  }, [isFocused, pendingVerificationEmail, clearPendingVerification]);

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
        console.log("✅ Login successful");
      }
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);
      
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      if (errorMessage.includes("verify")) {
        errorMessage = "Please verify your email before logging in. Check your inbox for the verification code.";
      }
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Animated.View 
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Decorative Elements */}
            <View className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20" />
            <View className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-50 rounded-full -ml-30 -mb-30" />
            
            <View className="px-6 pt-8 pb-8">
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-8"
                activeOpacity={0.7}
              >
                <ArrowLeft size={22} color="#374151" />
              </TouchableOpacity>

              {/* Header with Animated Icon */}
              <Animated.View 
                className="items-center mb-8"
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-lg"
                  style={{ shadowColor: "#10b981", shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } }}
                >
                  <Leaf size={40} color="#ffffff" />
                </LinearGradient>
                
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </Text>
                <Text className="text-gray-500 text-center text-base px-8">
                  Sign in to continue your journey with fresh farm products
                </Text>
              </Animated.View>

              {/* Form */}
              <View className="space-y-5 mt-4">
                {/* Email Field */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Email Address
                  </Text>
                  <View className={`relative rounded-2xl border-2 transition-all duration-200 ${
                    focusedField === 'email' 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Mail size={20} color={focusedField === 'email' ? "#10b981" : "#9CA3AF"} />
                    </View>
                    <TextInput
                      placeholder="you@example.com"
                      value={form.email}
                      onChangeText={(v) => setForm({ ...form, email: v })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="pl-12 pr-4 py-4 text-gray-900 text-base"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Password
                  </Text>
                  <View className={`relative rounded-2xl border-2 transition-all duration-200 ${
                    focusedField === 'password' 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock size={20} color={focusedField === 'password' ? "#10b981" : "#9CA3AF"} />
                    </View>
                    <TextInput
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={(v) => setForm({ ...form, password: v })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-12 pr-12 py-4 text-gray-900 text-base"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      activeOpacity={0.7}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity 
                  onPress={() => navigation.navigate("ForgotPassword")}
                  className="items-end mt-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-emerald-600 text-sm font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                  className="mt-4"
                >
                  <LinearGradient
                    colors={loading ? ["#9ca3af", "#6b7280"] : ["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl py-4 flex-row items-center justify-center shadow-lg"
                    style={{ shadowColor: "#10b981", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Text className="text-white font-semibold text-base mr-2">
                          Sign In
                        </Text>
                        <ChevronRight size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="mx-4 text-gray-400 text-sm">or</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Register Link */}
                <View className="flex-row justify-center items-center py-2">
                  <Text className="text-gray-500 text-base mr-1">
                    Don't have an account?
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate("Register")}
                    activeOpacity={0.7}
                  >
                    <Text className="text-emerald-600 font-bold text-base">
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Social Login Section */}
                <View className="mt-2">
                  <Text className="text-center text-gray-400 text-sm mb-4">
                    Or continue with
                  </Text>
                  <View className="flex-row justify-center space-x-4 gap-4">
                    <TouchableOpacity 
                      className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center border border-gray-200"
                      activeOpacity={0.7}
                    >
                      <Text className="text-2xl">G</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center border border-gray-200"
                      activeOpacity={0.7}
                    >
                      <Text className="text-2xl">f</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center border border-gray-200"
                      activeOpacity={0.7}
                    >
                      <Text className="text-2xl">A</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}