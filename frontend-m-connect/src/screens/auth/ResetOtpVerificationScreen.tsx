// src/screens/auth/ResetOtpVerificationScreen.tsx
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
import { verifyResetOtp, resendOtp } from "@/api/auth";

export default function ResetOtpVerificationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const email = route.params?.email;
  
  useEffect(() => {
    console.log("🔍 Reset OTP Screen mounted with email:", email);
    
    if (!email) {
      Alert.alert("Error", "No email provided", [
        { text: "Go Back", onPress: () => navigation.goBack() }
      ]);
    }
  }, [email, navigation]);

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

  const handleVerify = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address found');
      return;
    }
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Verifying reset OTP for email:", email, "code:", otpCode);
      
      const response = await verifyResetOtp(email, otpCode);
      console.log("Verify reset OTP response:", response);

      if (response.status === 'success') {
        console.log("✅ Reset OTP verification successful!");
        
        Alert.alert(
          'Success! 🎉',
          'Code verified. You can now reset your password.',
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate("ResetPassword", {
                  email: response.email,
                  resetToken: response.reset_token
                });
              }
            }
          ]
        );
      } else {
        setError(response.message || 'Invalid OTP code');
        Alert.alert('Verification Failed', response.message || 'Invalid OTP code');
      }
    } catch (error: any) {
      console.error('Verification error details:', error.response?.data);
      
      let errorMessage = 'Invalid or expired OTP code';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = String(firstError);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
      console.log("🔍 Resending reset OTP for email:", email);
      
      const response = await resendOtp(email);
      console.log("Resend reset OTP response:", response);

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

  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 text-lg mb-4 text-center">
            No email address provided
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-orange-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
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
              <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-6">
                <Mail size={48} color="#f97316" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Verify Your Code
              </Text>
              <Text className="text-gray-500 text-center">
                Enter the 6-digit code sent to
              </Text>
              <Text className="text-orange-500 font-semibold text-base mt-1">
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
                      ${digit ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
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
              className={`bg-orange-500 rounded-xl py-4 mb-4 ${
                loading || otp.join('').length !== 6 ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">
                  Verify Code
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
                  <ActivityIndicator size="small" color="#f97316" />
                ) : (
                  <View className="flex-row items-center">
                    <RefreshCw size={16} color={canResend ? "#f97316" : "#9ca3af"} />
                    <Text
                      className={`ml-1 font-semibold ${
                        canResend ? "text-orange-500" : "text-gray-400"
                      }`}
                    >
                      Resend Code
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.goBack()} className="mt-6">
              <Text className="text-gray-400 text-center">
                Wrong email?{" "}
                <Text className="text-orange-500">Go back</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}