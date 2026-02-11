import React from "react";
import { View, ActivityIndicator } from "react-native";

type LoaderProps = {
  fullScreen?: boolean;
  size?: "small" | "large";
};

const Loader: React.FC<LoaderProps> = ({
  fullScreen = true,
  size = "large",
}) => {
  if (!fullScreen) {
    return <ActivityIndicator size={size} color="#16a34a" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size={size} color="#16a34a" />
    </View>
  );
};

export default Loader;
