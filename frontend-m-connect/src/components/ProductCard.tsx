// src/components/ProductCard.tsx
import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductCardProps {
  item?: any;
  product?: any;
  onPress?: () => void;
  showCategory?: boolean;
  showRating?: boolean;
  showFarmer?: boolean;
}

export default function ProductCard({ 
  item, 
  product, 
  onPress,
  showCategory = true,
  showRating = true,
  showFarmer = false
}: ProductCardProps) {
  const data = item || product;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl shadow p-3 w-[160] mr-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image Container */}
      <View className="relative w-full h-28 rounded-lg overflow-hidden bg-gray-100">
        {/* Loading State */}
        {isLoading && (
          <View className="absolute inset-0 justify-center items-center">
            <ActivityIndicator size="small" color="#059669" />
          </View>
        )}
        
        {/* Error State */}
        {hasError ? (
          <View className="w-full h-full justify-center items-center bg-gray-200">
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
          </View>
        ) : (
          <Image
            source={{ uri: data.image || fallbackImage }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Stock Indicator */}
        {data.stock !== undefined && data.stock < 10 && (
          <View className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded-full">
            <Text className="text-xs text-white font-bold">Low Stock</Text>
          </View>
        )}

        {/* Category Tag */}
        {showCategory && data.category && (
          <View className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-full">
            <Text className="text-xs text-gray-700">{data.category}</Text>
          </View>
        )}

        {/* Rating Badge */}
        {showRating && data.rating && (
          <View className="absolute bottom-2 left-2 flex-row items-center px-2 py-1 bg-white/90 rounded-full">
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text className="text-xs font-bold ml-1">{data.rating}</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="mt-2">
        <Text className="font-semibold text-base text-gray-900" numberOfLines={1}>
          {data.name}
        </Text>
        
        {/* Farmer Name */}
        {showFarmer && data.farmerName && (
          <Text className="text-xs text-gray-600 mt-1" numberOfLines={1}>
            By {data.farmerName}
          </Text>
        )}
        
        {/* Location */}
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={12} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
            {data.location}
          </Text>
        </View>

        {/* Price */}
        <Text className="text-green-600 font-bold text-sm mt-2">
          {data.price}
        </Text>

        {/* Stock Indicator */}
        {data.stock !== undefined && (
          <View className="mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">Stock:</Text>
              <Text className={`text-xs font-medium ${
                data.stock > 20 ? 'text-green-600' : 
                data.stock > 5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {data.stock} units
              </Text>
            </View>
            <View className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <View 
                className={`h-full ${
                  data.stock > 20 ? 'bg-green-500' : 
                  data.stock > 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (data.stock / 100) * 100)}%` }}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}