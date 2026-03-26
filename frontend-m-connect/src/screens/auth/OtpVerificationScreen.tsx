// src/screens/auth/OtpVerificationScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Mail, RefreshCw } from "lucide-react-native";
import { verifyOtp, resendOtp } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OtpVerificationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { logout, refreshAuth, pendingVerificationEmail: contextEmail } = useAuth();
  
  // ✅ Get email from route params OR context
  const email = route.params?.email || contextEmail;
  
  useEffect(() => {
    console.log("🔍 OTP Screen mounted - route params email:", route.params?.email);
    console.log("🔍 OTP Screen mounted - context email:", contextEmail);
    console.log("🔍 OTP Screen mounted - final email:", email);
    
    if (!email) {
      console.error("❌ No email provided to OTP screen!");
      Alert.alert(
        "Error", 
        "No email address provided. Please go back and register again.",
        [
          { 
            text: "Go to Register", 
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Register' }],
                })
              );
            }
          }
        ]
      );
    }
  }, [email, route.params?.email, contextEmail, navigation]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(null);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // src/screens/auth/OtpVerificationScreen.tsx
// Replace the handleVerify function with this:

const handleVerify = async () => {
  const otpCode = otp.join('');
  if (otpCode.length !== 6) {
    Alert.alert('Error', 'Please enter complete 6-digit code');
    return;
  }

  setLoading(true);
  try {
    const response = await verifyOtp(email, otpCode);
    console.log("Verify OTP response:", response);

    if (response.status === 'success') {
      // Clear pending verification email
      await AsyncStorage.removeItem('pendingVerificationEmail');
      
      // Refresh auth context
      await refreshAuth();
      
      Alert.alert(
        'Success! 🎉',
        'Your email has been verified. You can now login.',
        [
          {
            text: 'Continue to Login',
            onPress: () => {
              // ✅ SIMPLE NAVIGATION - Replace with Login screen
              navigation.replace("Login");
            }
          }
        ]
      );
    } else {
      Alert.alert('Verification Failed', response.message || 'Invalid OTP');
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    Alert.alert(
      'Verification Failed',
      error.response?.data?.message || 'Invalid or expired OTP code'
    );
  } finally {
    setLoading(false);
  }
};
  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address found');
      return;
    }
    
    if (!canResend) return;

    setResendLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Resending OTP for email:", email);
      
      const response = await resendOtp(email);
      console.log("Resend OTP response:", response);

      if (response.status === 'success') {
        Alert.alert('Success', 'New verification code sent to your email');
        setTimeLeft(600);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError(null);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', response.message || 'Failed to resend code');
      }
    } catch (error: any) {
      console.error('Resend error details:', error.response?.data);
      
      let errorMessage = 'Failed to resend code. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleWrongEmail = async () => {
    Alert.alert(
      "Wrong Email?",
      "This will clear your registration and return to registration screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.removeItem('pendingVerificationEmail');
            await logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Register' }],
              })
            );
          }
        }
      ]
    );
  };

  // Show loading or error state if email is missing
  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 text-lg mb-4 text-center">
            No email address provided
          </Text>
          <TouchableOpacity
            onPress={() => navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Register' }],
              })
            )}
            className="bg-emerald-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go to Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>

            <View className="items-center mt-4 mb-10">
              <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
                <Mail size={48} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Verify Your Email
              </Text>
              <Text className="text-gray-500 text-center">
                Enter the 6-digit code sent to
              </Text>
              <Text className="text-emerald-600 font-semibold text-base mt-1">
                {email}
              </Text>
            </View>

            <View className="mb-8">
              <View className="flex-row justify-between px-2">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold
                      ${digit ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}
                      ${error ? 'border-red-500' : ''}`}
                    style={{ fontSize: 24 }}
                  />
                ))}
              </View>

              {error && (
                <Text className="text-red-500 text-center mt-2 text-sm">
                  {error}
                </Text>
              )}

              <Text className="text-center text-gray-500 mt-4">
                Code expires in {formatTime(timeLeft)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              className={`bg-emerald-600 rounded-xl py-4 mb-4 ${
                loading || otp.join('').length !== 6 ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">
                  Verify Email
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-gray-500">Didn't receive code? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend || resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <View className="flex-row items-center">
                    <RefreshCw size={16} color={canResend ? "#10b981" : "#9ca3af"} />
                    <Text
                      className={`ml-1 font-semibold ${
                        canResend ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      Resend Code
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleWrongEmail} className="mt-6">
              <Text className="text-gray-400 text-center">
                Wrong email?{" "}
                <Text className="text-emerald-600">Register again</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}