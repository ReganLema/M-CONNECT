import { Text, View } from "react-native";

export default function SectionHeader({ title }: { title: string }) {
  return (
    <View className="flex-row justify-between items-center px-4 mt-6 mb-2">
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
    </View>
  );
}
