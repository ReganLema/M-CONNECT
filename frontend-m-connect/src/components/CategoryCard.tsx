import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CategoryCardProps {
  name: string;
  image: string;
  description?: string;
  itemCount?: number;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  isSelected?: boolean;
  showOverlay?: boolean;
}

export default function CategoryCard({
  name,
  image,
  description,
  itemCount,
  onPress,
  size = 'medium',
  showLabel = true,
  isSelected = false,
  showOverlay = false,
}: CategoryCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-16 h-16', text: 'text-xs', badge: 'w-5 h-5 text-2xs' },
    medium: { container: 'w-20 h-20', text: 'text-sm', badge: 'w-6 h-6 text-xs' },
    large: { container: 'w-24 h-24', text: 'text-base', badge: 'w-7 h-7 text-sm' },
  };

  const { container, text, badge } = sizeConfig[size];
  const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <TouchableOpacity
      className="mr-4 items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`${container} rounded-xl bg-gray-100 shadow-lg relative overflow-hidden ${
        isSelected ? 'border-2 border-green-500' : ''
      }`}>
        {/* Loading state */}
        {isLoading && (
          <View className="absolute inset-0 justify-center items-center bg-gray-100">
            <ActivityIndicator size="small" color="#059669" />
          </View>
        )}

        {/* Error state */}
        {hasError ? (
          <View className="w-full h-full justify-center items-center bg-gray-200 rounded-xl">
            <Text className="text-gray-500 font-bold">{name.charAt(0)}</Text>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: image || fallbackImage }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Gradient overlay */}
            {showOverlay && (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                className="absolute inset-0 rounded-xl"
              />
            )}

            {/* Item count badge */}
            {itemCount !== undefined && itemCount > 0 && (
              <View className={`absolute -top-1 -right-1 bg-green-500 rounded-full ${badge} justify-center items-center border-2 border-white`}>
                <Text className="font-bold text-white">{itemCount > 99 ? '99+' : itemCount}</Text>
              </View>
            )}

            {/* Selected overlay */}
            {isSelected && (
              <View className="absolute inset-0 bg-green-500/20 rounded-xl" />
            )}
          </>
        )}
      </View>

      {/* Label */}
      {showLabel && (
        <View className="mt-2 max-w-20">
          <Text className={`${text} font-medium text-center ${
            isSelected ? 'text-green-600 font-bold' : 'text-gray-700'
          }`}>
            {name}
          </Text>
          
          {/* Description */}
          {description && size !== 'small' && (
            <Text className="text-xs text-gray-500 text-center mt-1" numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}