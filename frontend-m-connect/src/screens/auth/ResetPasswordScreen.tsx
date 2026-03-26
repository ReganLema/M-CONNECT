// src/screens/auth/ResetPasswordScreen.tsx
import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Shield, KeyRound } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "@/api/auth";
import { LinearGradient } from "expo-linear-gradient";

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const { email, resetToken } = route.params || {};
  
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
    color: string;
  }>({ score: 0, message: "", color: "#ef4444" });

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

  useEffect(() => {
    if (!email || !resetToken) {
      Alert.alert("Error", "Invalid reset session", [
        { text: "Go to Login", onPress: () => navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        ) }
      ]);
    }
  }, [email, resetToken, navigation]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let message = "";
    let color = "#ef4444";
    
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    
    if (score <= 2) {
      message = "Weak";
      color = "#ef4444";
    } else if (score <= 4) {
      message = "Medium";
      color = "#f59e0b";
    } else {
      message = "Strong";
      color = "#10b981";
    }
    
    setPasswordStrength({ score, message, color });
  };

  const validateForm = () => {
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleResetPassword = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(
        email,
        resetToken,
        form.password,
        form.confirmPassword
      );
      console.log("Reset password response:", response);

      if (response.status === "success") {
        Alert.alert(
          "Success! 🎉",
          "Your password has been reset successfully. Please login with your new password.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reset password. Please try again."
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
                className="items-center mb-8"
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <LinearGradient
                  colors={["#f97316", "#ea580c"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-lg"
                  style={{ shadowColor: "#f97316", shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } }}
                >
                  <KeyRound size={40} color="#ffffff" />
                </LinearGradient>
                
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Create New Password
                </Text>
                <Text className="text-gray-500 text-center text-base px-6">
                  Your new password must be different from previously used passwords.
                </Text>
              </Animated.View>

              {/* Security Tips Card */}
              <View className="bg-orange-50 rounded-2xl p-4 mb-6 flex-row items-start">
                <Shield size={20} color="#f97316" style={{ marginRight: 12, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-orange-700 font-semibold text-sm mb-1">
                    Password Requirements
                  </Text>
                  <Text className="text-orange-600 text-xs">
                    • At least 6 characters
                  </Text>
                  <Text className="text-orange-600 text-xs">
                    • Mix of uppercase, lowercase, numbers, and symbols
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View className="space-y-5">
                {/* New Password */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    New Password
                  </Text>
                  <View className={`relative rounded-2xl border-2 transition-all duration-200 ${
                    focusedField === 'password' 
                      ? 'border-orange-500 bg-orange-50/30' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock size={20} color={focusedField === 'password' ? "#f97316" : "#9CA3AF"} />
                    </View>
                    <TextInput
                      placeholder="Enter new password"
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={(text) => {
                        setForm({ ...form, password: text });
                        checkPasswordStrength(text);
                      }}
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
                      {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password Strength Indicator */}
                  {form.password.length > 0 && (
                    <View className="mt-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-xs text-gray-500">Password Strength</Text>
                        <Text style={{ color: passwordStrength.color }} className="text-xs font-semibold">
                          {passwordStrength.message}
                        </Text>
                      </View>
                      <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <Animated.View 
                          style={{ 
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                          className="h-full rounded-full"
                        />
                      </View>
                      <Text className="text-xs text-gray-400 mt-2">
                        Use at least 6 characters with letters, numbers, and symbols
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Confirm New Password
                  </Text>
                  <View className={`relative rounded-2xl border-2 transition-all duration-200 ${
                    focusedField === 'confirmPassword' 
                      ? 'border-orange-500 bg-orange-50/30' 
                      : form.confirmPassword.length > 0 && form.password !== form.confirmPassword
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-gray-200 bg-gray-50'
                  }`}>
                    <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock size={20} color={
                        focusedField === 'confirmPassword' ? "#f97316" : 
                        form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? "#ef4444" : "#9CA3AF"
                      } />
                    </View>
                    <TextInput
                      placeholder="Confirm new password"
                      secureTextEntry={!showConfirmPassword}
                      value={form.confirmPassword}
                      onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-12 pr-12 py-4 text-gray-900 text-base"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      activeOpacity={0.7}
                    >
                      {showConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password Match Indicator */}
                  {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                    <View className="flex-row items-center mt-2 ml-1">
                      <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                      <Text className="text-red-500 text-xs">
                        Passwords do not match
                      </Text>
                    </View>
                  )}
                  {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
                    <View className="flex-row items-center mt-2 ml-1">
                      <CheckCircle size={14} color="#10b981" />
                      <Text className="text-green-500 text-xs ml-1.5 font-medium">
                        Passwords match
                      </Text>
                    </View>
                  )}
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.9}
                  className="mt-4"
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
                      <Text className="text-white font-semibold text-base">
                        Reset Password
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-4">
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
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}