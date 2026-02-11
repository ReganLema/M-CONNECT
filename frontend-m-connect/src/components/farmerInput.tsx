import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type Props = {
  label: string;
  error?: string;
} & TextInputProps;

const Input: React.FC<Props> = ({ label, error, ...props }) => {
  return (
    <View className="mb-4">
      <Text className="text-gray-600 mb-1">{label}</Text>
      <TextInput
        {...props}
        className={`border rounded-xl p-3 text-base ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <Text className="text-red-500 mt-1 text-sm">{error}</Text>}
    </View>
  );
};

export default Input;
