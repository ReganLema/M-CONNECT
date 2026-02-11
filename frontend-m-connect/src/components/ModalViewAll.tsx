



// src/components/ModalViewAll.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';

interface ModalViewAllProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  type: 'categories' | 'products';
  data: any[];
  loading?: boolean;
  onItemPress?: (item: any) => void;
}

export default function ModalViewAll({
  visible,
  onClose,
  title,
  type,
  data,
  loading = false,
  onItemPress,
}: ModalViewAllProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // Filter data based on search query
  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        const itemName = item.name?.toLowerCase() || item.title?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return itemName.includes(query);
      });
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  const renderCategoryItem = ({ item }: { item: any }) => (
    <View className="w-1/2 p-2">
      <CategoryCard
        name={item.name}
        image={item.image}
        onPress={() => {
          onItemPress?.(item);
          onClose();
        }}
        showLabel={true}
        size="large"
      />
    </View>
  );

  const renderProductItem = ({ item }: { item: any }) => (
    <View className="w-1/2 p-2">
      <ProductCard
        product={item}
        onPress={() => {
          onItemPress?.(item);
          onClose();
        }}
        showRating={true}
        showCategory={true}
      />
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                placeholder={`Search ${type}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-gray-700"
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="mt-3 text-gray-600">Loading {type}...</Text>
              </View>
            ) : filteredData.length === 0 ? (
              <View className="flex-1 justify-center items-center p-8">
                <Ionicons name="search-outline" size={64} color="#d1d5db" />
                <Text className="text-xl font-semibold text-gray-400 mt-4">
                  No {type} found
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  {searchQuery ? `No results for "${searchQuery}"` : `No ${type} available`}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={type === 'categories' ? renderCategoryItem : renderProductItem}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View className="px-2 pb-4">
                    <Text className="text-gray-600">
                      {filteredData.length} {type} found
                      {searchQuery && ` for "${searchQuery}"`}
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          {/* Footer */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="py-3 bg-emerald-600 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}