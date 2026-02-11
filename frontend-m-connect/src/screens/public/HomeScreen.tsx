// HomeScreen.tsx 
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext"; 
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import ModalViewAll from "@/components/ModalViewAll"; 
import LoginPromptModal from "@/components/LoginPromptModal";

import { getCategories, staticCategories as defaultCategories } from "@/data/categories";
import { getProducts, products as defaultProducts } from "@/data/products";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [categories, setCategories] = useState(defaultCategories);
  const [products, setProducts] = useState(defaultProducts);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState<'categories' | 'products'>('categories');
  const [modalData, setModalData] = useState<any[]>([]);
  
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  useEffect(() => {
    loadDynamicContent();
  }, []);

  const loadDynamicContent = async () => {
    await Promise.all([
      loadDynamicCategories(),
      loadDynamicProducts()
    ]);
  };

  const loadDynamicCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const dynamicCategories = await getCategories();
      setCategories(dynamicCategories);
    } catch (error) {
      console.log("Using static categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadDynamicProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const dynamicProducts = await getProducts();
      setProducts(dynamicProducts);
    } catch (error) {
      console.log("Using static products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // ✅ Individual category images require auth
  const handleCategoryPress = (category: any) => {
    if (!user) {
      setLoginPromptVisible(true);
      return;
    }
    console.log("Category pressed:", category.name);
    navigation.navigate("Market", { category: category.name });
  };

  // ✅ Individual product images require auth
  const handleProductPress = (product: any) => {
    if (!user) {
      setLoginPromptVisible(true);
      return;
    }
    console.log("Product pressed:", product.name);
    navigation.navigate("Market", { product });
  };

  // ✅ Modal items require auth (when selecting from modal)
  const handleModalItemPress = (item: any) => {
    if (!user) {
      setLoginPromptVisible(true);
      return;
    }
    
    if (modalType === 'categories') {
      console.log("Category selected from modal:", item.name);
      navigation.navigate("Market", { 
        category: item.name,
        categoryId: item.id 
      });
    } else {
      console.log("Product selected from modal:", item.name);
      navigation.navigate("Market", { product: item });
    }
  };

  // ✅ "See All" Categories button - NO AUTH REQUIRED
  const handleViewAllCategories = () => {
    setModalTitle('All Categories');
    setModalType('categories');
    setModalData(categories);
    setModalVisible(true);
  };

  // ✅ "View All" Products button - NO AUTH REQUIRED
  const handleViewAllProducts = () => {
    setModalTitle('All Products');
    setModalType('products');
    setModalData(products);
    setModalVisible(true);
  };

  // Search still requires auth
  const handleSearch = () => {
    if (!user) {
      setLoginPromptVisible(true);
      return;
    }
    navigation.navigate("Search");
  };

  // Filter still requires auth
  const handleFilterPress = () => {
    if (!user) {
      setLoginPromptVisible(true);
      return;
    }
    navigation.navigate("Filters");
  };

  const handleLogin = () => {
    setLoginPromptVisible(false);
    navigation.getParent()?.navigate("Auth", { screen: "Login" });
  };

  const handleRegister = () => {
    setLoginPromptVisible(false);
    navigation.getParent()?.navigate("Auth", { screen: "Register" });
  };

  // ✅ Navigate to guide screens - NO AUTH REQUIRED
  const handleGuidePress = (guideType: string) => {
    if (guideType === 'farmer') {
      navigation.navigate('StartFarming');
    } else if (guideType === 'business') {
      navigation.navigate('StartBusiness');
    } else if (guideType === 'trends') {
      navigation.navigate('MarketTrends');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          {/* Header Section */}
          <LinearGradient
            colors={["#059669", "#10b981", "#34d399"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 pt-10 pb-8 rounded-b-3xl shadow-2xl"
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 mr-4">
                <Text className="text-3xl font-bold text-white leading-tight">
                  Welcome to{"\n"}Mkulima Connect
                </Text>
                <Text className="text-green-100 text-base mt-2 opacity-90">
                  Fresh produce from trusted farmers
                </Text>
              </View>

              <TouchableOpacity
                className="p-3 rounded-2xl bg-white/10 border border-white/20"
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="white"
                />
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
              </TouchableOpacity>
            </View>

            {!user && (
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 px-5 py-4 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-sm"
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation
                      .getParent()
                      ?.navigate("Auth", { screen: "Login" })
                  }
                >
                  <Text className="text-white font-semibold text-center text-base">
                    Login
                  </Text>
                </TouchableOpacity>

                <LinearGradient
                  colors={["#ffffff", "#f0fdf4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-1 rounded-2xl shadow-lg"
                >
                  <TouchableOpacity
                    className="px-5 py-4"
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation
                        .getParent()
                        ?.navigate("Auth", { screen: "Register" })
                    }
                  >
                    <Text className="text-emerald-700 font-semibold text-center text-base">
                      Register
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </LinearGradient>

          {/* Search Bar */}
          <View className="px-6 -mt-6 z-10">
            <TouchableOpacity 
              className="flex-row items-center bg-white rounded-3xl shadow-xl p-1.5 pl-5 border border-gray-100"
              activeOpacity={0.7}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={20} color="#9ca3af" />
              <View className="flex-1 ml-3 p-3">
                <Text className="text-gray-400 text-base">Search fresh products...</Text>
              </View>
              <TouchableOpacity
                className="p-3 rounded-xl bg-emerald-50 ml-2"
                activeOpacity={0.7}
                onPress={handleFilterPress}
              >
                <Ionicons name="filter" size={18} color="#059669" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View className="flex-1 px-6 pt-6">
            {/* Banner Carousel */}
            <View className="rounded-3xl overflow-hidden shadow-lg mb-8 border border-gray-100 bg-white">
              <BannerCarousel />
            </View>

            {/* Categories Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-5">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">
                    Categories
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Browse by category
                  </Text>
                </View>
                {/* ✅ "See All" button - NO AUTH REQUIRED */}
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={handleViewAllCategories}
                  activeOpacity={0.7}
                >
                  <Text className="text-emerald-600 font-semibold mr-1">
                    See All
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#059669"
                  />
                </TouchableOpacity>
              </View>

              {isLoadingCategories ? (
                <View className="flex-row justify-center py-10">
                  <ActivityIndicator size="small" color="#059669" />
                  <Text className="ml-3 text-gray-600">Loading categories...</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {categories.map((category, index) => (
                    <View
                      key={category.id}
                      className={index === 0 ? "ml-0" : "ml-4"}
                    >
                      {/* ✅ Individual category images - AUTH REQUIRED */}
                      <CategoryCard
                        name={category.name}
                        image={category.image}
                        onPress={() => handleCategoryPress(category)}
                        showLabel={true}
                        size="medium"
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Products Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-5">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">
                    Popular Products
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Fresh from our farms
                  </Text>
                </View>
                {/* ✅ "View All" button - NO AUTH REQUIRED */}
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={handleViewAllProducts}
                  activeOpacity={0.7}
                >
                  <Text className="text-emerald-600 font-semibold mr-1">
                    View All
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#059669"
                  />
                </TouchableOpacity>
              </View>

              {isLoadingProducts ? (
                <View className="flex-row justify-center py-10">
                  <ActivityIndicator size="small" color="#059669" />
                  <Text className="ml-3 text-gray-600">Loading products...</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {products.map((product, index) => (
                    <View
                      key={product.id}
                      className={index === 0 ? "ml-0" : "ml-5"}
                    >
                      {/* ✅ Individual product images - AUTH REQUIRED */}
                      <ProductCard 
                        product={product} 
                        onPress={() => handleProductPress(product)}
                        showRating={true}
                        showCategory={true}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* ✅ Agribusiness Guide Section (Navigation Only) - NO AUTH REQUIRED */}
            <AgribusinessGuideSection onGuidePress={handleGuidePress} />

            {/* Stats Card */}
            <LinearGradient
              colors={["#f0fdf4", "#ecfdf5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-6 mb-8 shadow-lg border border-emerald-100"
            >
              <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
                Our Community Impact
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-2">
                    <Ionicons name="people" size={24} color="#059669" />
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">200+</Text>
                  <Text className="text-gray-600 mt-1 text-sm">Farmers</Text>
                </View>

                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-2">
                    <Ionicons name="basket" size={24} color="#059669" />
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">500+</Text>
                  <Text className="text-gray-600 mt-1 text-sm">Products</Text>
                </View>

                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-2">
                    <Ionicons name="star" size={24} color="#059669" />
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">4.8</Text>
                  <Text className="text-gray-600 mt-1 text-sm">Rating</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Bottom Info Card */}
            <View className="rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-6 mb-10 shadow-xl">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center mr-3">
                  <Ionicons name="leaf" size={20} color="white" />
                </View>
                <Text className="text-xl font-bold text-white">
                  Fresh & Organic
                </Text>
              </View>
              <Text className="text-gray-300 text-sm mb-4">
                All our products are sourced directly from verified farmers,
                ensuring freshness and supporting local agriculture.
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-center py-3 rounded-xl bg-white/10 border border-white/20"
                activeOpacity={0.7}
                onPress={() => navigation.getParent()?.navigate("About")}
              >
                <Text className="text-white font-semibold mr-2">
                  Learn More
                </Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* View All Modal - Shows preview even without auth */}
      <ModalViewAll
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        type={modalType}
        data={modalData}
        loading={modalType === 'categories' ? isLoadingCategories : isLoadingProducts}
        onItemPress={handleModalItemPress} // Items in modal still require auth
      />

      <LoginPromptModal
        visible={loginPromptVisible}
        onClose={() => setLoginPromptVisible(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </SafeAreaView>
  );
}

// ✅ Agribusiness Guide Section (Navigation Only - No Mock Data)
const AgribusinessGuideSection = ({ onGuidePress }: { onGuidePress: (type: string) => void }) => {
  const guides = [
    {
      id: 1,
      title: "Start Farming",
      subtitle: "For Aspiring Farmers",
      icon: "leaf",
      color: "#10B981",
      bgColor: "#D1FAE5",
      type: "farmer"
    },
    {
      id: 2,
      title: "Start Business",
      subtitle: "For Entrepreneurs",
      icon: "storefront",
      color: "#3B82F6",
      bgColor: "#DBEAFE",
      type: "business"
    },
    {
      id: 3,
      title: "Market Trends",
      subtitle: "High-Demand Products",
      icon: "trending-up",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      type: "trends"
    },
  ];

  return (
    <View className="mb-8">
      <View className="mb-5">
        <Text className="text-2xl font-bold text-gray-900">
          🌱 Agribusiness Guide
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Start your farming or business journey
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {guides.map((guide, index) => (
          <TouchableOpacity
            key={guide.id}
            className={`rounded-3xl p-5 shadow-lg ${index === 0 ? "ml-0" : "ml-4"}`}
            style={{ backgroundColor: guide.bgColor, width: 220 }}
            activeOpacity={0.8}
            onPress={() => onGuidePress(guide.type)}
          >
            <View 
              className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: guide.color }}
            >
              <Ionicons name={guide.icon as any} size={28} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {guide.title}
            </Text>
            <Text className="text-gray-600 text-sm">
              {guide.subtitle}
            </Text>
            <View className="flex-row items-center mt-3">
              <Text className="text-gray-700 font-semibold text-xs">
                Learn More
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#4B5563" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};