// src/components/LoginPromptModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  title?: string;
  message?: string;
}

export default function LoginPromptModal({
  visible,
  onClose,
  onLogin,
  onRegister,
  title = "Authentication Required",
  message = "Please login or register to access this feature"
}: LoginPromptModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
          {/* Header */}
          <LinearGradient
            colors={["#059669", "#10b981"]}
            className="p-6 items-center"
          >
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={36} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              {title}
            </Text>
            <Text className="text-emerald-100 text-center mt-2">
              {message}
            </Text>
          </LinearGradient>

          {/* Content */}
          <View className="p-6">
            <View className="bg-emerald-50 rounded-2xl p-5 mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text className="text-emerald-700 font-medium ml-2">
                  Benefits of creating an account:
                </Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-3" />
                  <Text className="text-gray-700 text-sm">Browse all products</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-3" />
                  <Text className="text-gray-700 text-sm">Connect with farmers</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-3" />
                  <Text className="text-gray-700 text-sm">Save favorite items</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-3" />
                  <Text className="text-gray-700 text-sm">Fast checkout</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={onLogin}
                className="py-4 bg-emerald-600 rounded-xl items-center active:bg-emerald-700"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg">
                  Login to Continue
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onRegister}
                className="py-4 border-2 border-emerald-600 rounded-xl items-center active:bg-emerald-50"
                activeOpacity={0.8}
              >
                <Text className="text-emerald-700 font-bold text-lg">
                  Create New Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-500">
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}