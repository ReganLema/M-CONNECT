// src/components/common/AppButton.tsx
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const AppButton: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = "",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`bg-blue-600 py-3 rounded-xl items-center flex-row justify-center ${disabled || loading ? "opacity-60" : ""} ${className}`}
    >
      <Text className="text-white font-semibold text-lg">{title}</Text>
      {loading && <ActivityIndicator color="#fff" className="ml-2" />}
    </TouchableOpacity>
  );
};

export default AppButton;
