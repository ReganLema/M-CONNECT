import React from "react";
import { View, Text } from "react-native";
import AppButton from "./AppButton";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-xl font-semibold text-gray-800 text-center">
        {title}
      </Text>

      {description && (
        <Text className="text-gray-500 text-center mt-2">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <View className="mt-6 w-full">
          <AppButton title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
};

export default EmptyState;
