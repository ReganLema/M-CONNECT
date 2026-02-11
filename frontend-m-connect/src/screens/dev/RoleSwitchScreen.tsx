import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RoleSwitchScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-gray-100 justify-center px-6">
      <Text className="text-2xl font-bold text-center mb-6">
        Switch App Mode (DEV)
      </Text>

      <TouchableOpacity
        onPress={() => {
          console.log("Switch to Buyer");
          navigation.goBack();
        }}
        className="bg-green-600 py-4 rounded-xl mb-4"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Buyer Mode
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log("Switch to Farmer");
          navigation.goBack();
        }}
        className="bg-blue-600 py-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Farmer Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}
