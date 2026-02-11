// src/components/Skeleton.tsx
import React from "react";
import { View } from "react-native";

const Skeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="h-24 bg-gray-200 rounded-xl mb-4 animate-pulse"
        />
      ))}
    </>
  );
};

export default Skeleton;
