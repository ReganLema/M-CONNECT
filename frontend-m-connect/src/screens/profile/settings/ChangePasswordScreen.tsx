// src/screens/profile/settings/ChangePasswordScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { changePassword } from "../../../api/auth";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Old password is required";
      isValid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

 const handleChangePassword = async () => {
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const response = await changePassword({
      oldPassword,
      newPassword,
      newPassword_confirmation: confirmPassword, // Send confirmation field
    });

    if (response.success) {
      Alert.alert(
        "Success",
        "Your password has been updated successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      Alert.alert("Error", response.message || "Failed to update password");
    }
  } catch (error: any) {
    console.error("Change password error:", error);
    
    // Display detailed error messages
    if (error.message.includes('\n')) {
      // Multiple validation errors
      Alert.alert("Validation Error", error.message);
    } else {
      Alert.alert("Error", error.message || "Failed to update password. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleCancel = () => {
    if (oldPassword || newPassword || confirmPassword) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive", 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4 bg-white shadow-sm">
        <TouchableOpacity onPress={handleCancel} className="p-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Lock size={20} color="#10B981" />
            <Text className="ml-2 text-gray-700">
              Secure your account with a new password
            </Text>
          </View>
          
          <Text className="text-gray-500 text-sm mb-6">
            For security, your new password must be different from your previous passwords and contain at least 8 characters.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-6 text-gray-800 border-b border-gray-100 pb-3">
            Password Update
          </Text>

          {/* Old Password */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Current Password</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={(text) => {
                  setOldPassword(text);
                  if (errors.oldPassword) {
                    setErrors({ ...errors, oldPassword: "" });
                  }
                }}
                placeholder="Enter your current password"
                className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-300 pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-3"
              >
                {showOldPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.oldPassword ? (
              <Text className="text-red-500 text-xs mt-1">{errors.oldPassword}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">New Password</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: "" });
                  }
                }}
                placeholder="Enter your new password"
                className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-300 pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3"
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            
            {errors.newPassword ? (
              <Text className="text-red-500 text-xs mt-1">{errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Confirm New Password */}
          <View className="mb-2">
            <Text className="text-gray-700 font-medium mb-2">Confirm New Password</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: "" });
                  }
                }}
                placeholder="Re-enter your new password"
                className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-300 pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
            ) : null}
            
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text className="text-red-500 text-xs mt-1">
                Passwords do not match
              </Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleChangePassword} 
          disabled={isLoading}
          activeOpacity={0.8}
          className="mb-4"
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={[0, 0]}
            end={[1, 0]}
            className={`py-4 rounded-2xl shadow-lg ${isLoading ? 'opacity-80' : ''}`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-center text-white text-lg font-bold ml-2">
                  Updating...
                </Text>
              </View>
            ) : (
              <Text className="text-center text-white text-lg font-bold">
                Update Password
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity 
          onPress={handleCancel}
          disabled={isLoading}
          className="py-4 rounded-2xl bg-gray-200 shadow-sm"
        >
          <Text className="text-center text-gray-700 text-lg font-medium">
            Cancel
          </Text>
        </TouchableOpacity>

        {/* Simple Security Tips */}
        <View className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Text className="text-blue-800 font-medium mb-3">Security Tips</Text>
          <Text className="text-blue-700 text-sm mb-2">
            • Use a unique password that you don't use elsewhere
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            • Consider using a password manager
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            • Never share your password with anyone
          </Text>
          <Text className="text-blue-700 text-sm">
            • Change your password regularly
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}