import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      <Text className="text-3xl font-bold text-green-700 mb-6">
        Privacy Policy
      </Text>

      <View className="bg-white rounded-2xl p-5 shadow-md">
        <Text className="text-gray-700 text-base leading-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </Text>

        <Text className="text-gray-700 text-base leading-6 mt-4">
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
          officia deserunt mollit anim id est laborum.
        </Text>
      </View>
    </ScrollView>
  );
}
