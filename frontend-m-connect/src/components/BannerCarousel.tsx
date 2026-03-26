// src/components/BannerCarousel.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { fetchMultipleImages } from '@/services/imageService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Local banner data as fallback
const localBanners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1505253668822-42074d58a7c6?w=800&q=80',
    title: "Farm Fresh",
    description: "Direct from local farms"
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517817748493-49ec54a32465?w=800&q=80',
    title: "Organic Vegetables",
    description: "100% natural, no pesticides"
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    title: "Seasonal Fruits",
    description: "Freshly harvested daily"
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1500479694472-551d1fb6258d?w=800&q=80',
    title: "Healthy Livestock",
    description: "Premium quality meat"
  }
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState(localBanners);
  const [loading, setLoading] = useState(true);
  const [imageSources, setImageSources] = useState<Record<string, string>>({});
  
  // ✅ Use Reanimated shared values
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Animated scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const newIndex = Math.round(event.contentOffset.x / width);
      if (newIndex !== currentIndex) {
        runOnJS(setCurrentIndex)(newIndex);
      }
    },
  });

  // ✅ Create animated styles for all dots at once (fixes the hook order issue)
  const dotAnimatedStyles = banners.map((_, index) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
      
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );
      
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1.2, 0.8],
        Extrapolate.CLAMP
      );
      
      return {
        opacity: withTiming(opacity, { duration: 200 }),
        transform: [{ scale: withTiming(scale, { duration: 200 }) }],
      };
    });
  });

  // Fetch dynamic banners on mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('🔄 Starting banner image fetch...');
        
        const bannerQueries = [
          { key: 'banner1', query: 'farm landscape Tanzania agriculture', orientation: 'landscape' as const, size: 'large' as const },
          { key: 'banner2', query: 'fresh vegetables market Africa', orientation: 'landscape' as const, size: 'large' as const },
          { key: 'banner3', query: 'tropical fruits market Tanzania', orientation: 'landscape' as const, size: 'large' as const },
          { key: 'banner4', query: 'cattle farming livestock Tanzania', orientation: 'landscape' as const, size: 'large' as const },
        ];

        const bannerImages = await fetchMultipleImages(bannerQueries);
        setImageSources(bannerImages);
        
        const updatedBanners = localBanners.map((banner, index) => ({
          ...banner,
          image: bannerImages[`banner${index + 1}`] || banner.image
        }));
        
        setBanners(updatedBanners);
        console.log('✅ Banners fetched successfully');
        
      } catch (error) {
        console.log('⚠️ Using default banners due to fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (banners.length <= 1) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      handleDotPress(nextIndex);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length, currentIndex]);

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const renderDots = () => (
    <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center">
      {banners.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleDotPress(index)}
          className="mx-1"
          activeOpacity={0.7}
        >
          <Animated.View
            className="w-2.5 h-2.5 rounded-full bg-white"
            style={[
              dotAnimatedStyles[index],
              { opacity: index === currentIndex ? 1 : 0.5 }
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSourceBadge = (bannerId: number) => {
    const imageKey = `banner${bannerId}`;
    const imageUrl = imageSources[imageKey] || '';
    
    let source = 'local';
    if (imageUrl.includes('pexels.com')) source = 'pexels';
    else if (imageUrl.includes('unsplash.com')) source = 'unsplash';
    
    return (
      <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-full">
        <Text className="text-white text-xs">via {source}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="h-48 rounded-2xl mx-4 bg-gradient-to-r from-gray-100 to-gray-200 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-gray-600 font-medium">Loading banners...</Text>
        <Text className="text-gray-500 text-sm mt-1">Fetching fresh images</Text>
      </View>
    );
  }

  return (
    <View className="relative">
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="rounded-2xl mx-4 overflow-hidden shadow-lg"
      >
        {banners.map((banner, index) => (
          <View key={banner.id} style={{ width: width - 32 }}>
            <View className="relative h-48 overflow-hidden">
              <Image
                source={{ uri: banner.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                className="absolute bottom-0 left-0 right-0 h-24"
              />
              
              {renderSourceBadge(banner.id)}
              
              <View className="absolute bottom-0 left-0 right-0 p-4">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="sparkles" size={16} color="#fbbf24" />
                  <Text className="text-white text-sm font-semibold ml-2">
                    {banner.title}
                  </Text>
                </View>
                <Text className="text-gray-200 text-sm">
                  {banner.description}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="w-1 h-4 bg-emerald-400 rounded-full mr-2" />
                  <Text className="text-emerald-300 text-xs font-medium">
                    Tap to explore →
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      
      {renderDots()}
      
      <View className="absolute top-2 left-6 bg-emerald-600/90 px-3 py-1 rounded-full">
        <Text className="text-white text-xs font-bold">Sponsored</Text>
      </View>
    </View>
  );
}