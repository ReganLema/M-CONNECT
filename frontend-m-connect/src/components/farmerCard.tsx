// src/components/Card.tsx
import React, { JSX } from "react";
import { View, Text } from "react-native";

type CardProps = {
  title: string;
  value: string;
  icon: JSX.Element;
};

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <View className="flex-1 min-w-[48%] bg-gray-100 rounded-xl p-4 flex-row items-center">
      {icon}
      <View className="ml-4">
        <Text className="text-gray-500">{title}</Text>
        <Text className="text-xl font-bold">{value}</Text>
      </View>
    </View>
  );
};

export default Card;
