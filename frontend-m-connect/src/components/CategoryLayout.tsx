import React from "react";
import { View, Text, Image, FlatList } from "react-native";

// 1. Define item type
export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  image: string;
}

// 2. Define props type
interface CategoryLayoutProps {
  title: string;
  data: CategoryItem[];
}

// 3. Component with typed props
const CategoryLayout: React.FC<CategoryLayoutProps> = ({ title, data }) => {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">{title}</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-4 rounded-lg bg-gray-100 p-3">
            <Image
              source={{ uri: item.image }}
              className="w-full h-40 rounded-lg mb-2"
            />
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-600">{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default CategoryLayout;
