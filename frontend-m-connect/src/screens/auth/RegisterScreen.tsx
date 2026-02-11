// src/screens/auth/RegisterScreen.tsx
import React, { useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/api/auth";
import { Eye, EyeOff, User, Mail, Lock, ChevronRight, ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 

const ROLES = [
  { label: "👨‍🌾 Farmer – Sell farm products", value: "farmer" },
  { label: "🛒 Buyer – Buy farm products", value: "buyer" },
] as const;

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email address is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleRegisterPress = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setLoading(true);

    try {
      const response = await register(form.name, form.email, form.password, form.role);

      console.log("REGISTER RESPONSE:", response);

      if (response.status === "success") {
        Alert.alert(
          "Registration Successful! 🎉",
          "Your account has been created. Please login to continue.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );

        // Reset form
        setForm({ name: "", email: "", password: "", confirmPassword: "", role: "buyer" });
      } else {
        Alert.alert("Registration Failed", response.message || "Something went wrong. Try again.");
      }
    } catch (err: any) {
      console.log("REGISTER ERROR:", err);
      Alert.alert("Registration Failed", err.message || "Something went wrong. Try again.");
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
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
            <Text className="text-gray-500 text-base">Join thousands of farmers and buyers</Text>
          </View>

          {/* Form */}
          <View className="px-6 space-y-5">
            {/* Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <User size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="John Doe"
                  value={form.name}
                  onChangeText={(v) => setForm({ ...form, name: v })}
                  className="border border-gray-200 rounded-xl pl-12 pr-4 py-4 bg-gray-50 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

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
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Re-enter your password"
                  secureTextEntry={!showConfirmPassword}
                  value={form.confirmPassword}
                  onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
                  className="border border-gray-200 rounded-xl pl-12 pr-12 py-4 bg-gray-50 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Role */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-3">I want to join as</Text>
              <View className="space-y-3">
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setForm({ ...form, role: r.value })}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      form.role === r.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        form.role === r.value ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                      }`}
                    >
                      {form.role === r.value && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                    <Text className="text-gray-800 text-base">{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegisterPress}
              disabled={loading}
              className={`mt-6 bg-emerald-600 rounded-xl py-4 flex-row items-center justify-center ${
                loading ? "opacity-70" : ""
              }`}
            >
              {loading ? (
                <Text className="text-white font-semibold text-base">Creating Account...</Text>
              ) : (
                <>
                  <Text className="text-white font-semibold text-base mr-2">Create Account</Text>
                  <ChevronRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center py-6">
              <Text className="text-gray-500 mr-1">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-emerald-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
