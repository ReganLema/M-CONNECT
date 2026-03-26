// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, ArrowLeft, Send, Key, Shield, AlertCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { forgotPassword } from "@/api/auth";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError("Email address is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) validateEmail(text);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      // ✅ Fix: Provide a fallback error message if emailError is null
      Alert.alert("Validation Error", emailError || "Invalid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      console.log("Forgot password response:", response);

      if (response.status === "success") {
        Alert.alert(
          "Code Sent! 📧",
          "We've sent a verification code to your email. Please check your inbox.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("ResetOtpVerification", { email }),
            },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to send reset code");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send reset code. Please try again."
      );
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
            <View className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full -mr-20 -mt-20" />
            <View className="absolute bottom-0 left-0 w-60 h-60 bg-orange-50 rounded-full -ml-30 -mb-30" />
            
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
                className="items-center mb-10"
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <LinearGradient
                  colors={["#f97316", "#ea580c"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-lg"
                  style={{ shadowColor: "#f97316", shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } }}
                >
                  <Key size={40} color="#ffffff" />
                </LinearGradient>
                
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </Text>
                <Text className="text-gray-500 text-center text-base px-6">
                  Don't worry! Enter your email address and we'll send you a verification code to reset your password.
                </Text>
              </Animated.View>

              {/* Info Card */}
              <View className="bg-orange-50 rounded-2xl p-4 mb-6 flex-row items-start">
                <Shield size={20} color="#f97316" style={{ marginRight: 12, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-orange-700 font-semibold text-sm mb-1">
                    Security Note
                  </Text>
                  <Text className="text-orange-600 text-xs">
                    You'll receive a 6-digit verification code. This code expires in 10 minutes.
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View className="space-y-6">
                {/* Email Field */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Email Address
                  </Text>
                  <View className={`relative rounded-2xl border-2 transition-all duration-200 ${
                    focusedField === 'email' 
                      ? 'border-orange-500 bg-orange-50/30' 
                      : emailError 
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-gray-200 bg-gray-50'
                  }`}>
                    <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Mail size={20} color={focusedField === 'email' ? "#f97316" : emailError ? "#ef4444" : "#9CA3AF"} />
                    </View>
                    <TextInput
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => {
                        setFocusedField(null);
                        validateEmail(email);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="pl-12 pr-4 py-4 text-gray-900 text-base"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {emailError && (
                    <View className="flex-row items-center mt-2 ml-1">
                      <AlertCircle size={12} color="#ef4444" />
                      <Text className="text-red-500 text-xs ml-1">{emailError}</Text>
                    </View>
                  )}
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.9}
                  className="mt-2"
                >
                  <LinearGradient
                    colors={loading ? ["#9ca3af", "#6b7280"] : ["#f97316", "#ea580c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl py-4 flex-row items-center justify-center shadow-lg"
                    style={{ shadowColor: "#f97316", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Send size={20} color="#fff" />
                        <Text className="text-white font-semibold text-base ml-2">
                          Send Reset Code
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-2">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="mx-4 text-gray-400 text-sm">or</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Back to Login */}
                <View className="flex-row justify-center items-center py-2">
                  <Text className="text-gray-500 text-base mr-1">
                    Remember your password?
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate("Login")}
                    activeOpacity={0.7}
                  >
                    <Text className="text-orange-500 font-bold text-base">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Help Text */}
                <View className="items-center mt-4">
                  <Text className="text-gray-400 text-xs text-center">
                    Having trouble? Contact our support team
                  </Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text className="text-orange-500 text-xs font-semibold mt-1">
                      support@mkulimaconnect.com
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}