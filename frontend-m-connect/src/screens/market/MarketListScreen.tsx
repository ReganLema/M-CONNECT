// src/screens/market/MarketListScreen.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import MarketProductCard from "../../components/MarketProductCard";
import publicApi from "../../services/publicApi";
import { Product } from "@/types/Product";

const categories = [
  "All",
  "Vegetables",
  "Fruits",
  "Livestock",
  "Cereals",
  "Poultry",
  "Seeds",
];

const CATEGORY_WIDTH = 96;

export default function MarketListScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const underlineAnim = useRef(new Animated.Value(0)).current;

  //  Fetch products (UNCHANGED)
  const fetchProducts = async () => {
    try {
      setError(null);

      const params: Record<string, string> = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      console.log("🔄 Fetching products from public API...");

      const response = await publicApi.get("/public/products", { params });

      const rawData =
        typeof response.data === "string"
          ? JSON.parse(response.data.replace(/^\uFEFF/, ""))
          : response.data;

      console.log("📦 Normalized products response:", rawData);

      if (
        rawData.status === "success" &&
        rawData.data &&
        Array.isArray(rawData.data.products)
      ) {
        setProducts(rawData.data.products);
        console.log(`✅ Loaded ${rawData.data.products.length} products`);
      } else {
        throw new Error("Invalid products response structure");
      }
    } catch (err: any) {
      console.error("❌ Error fetching products:", err);

      let message = "Failed to load products. Please try again.";

      if (err.response?.status === 404) {
        message = "Products endpoint not found.";
      } else if (err.message?.includes("Network")) {
        message = "Network error. Check your internet connection.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load (UNCHANGED)
  useEffect(() => {
    fetchProducts();
  }, []);

  // Refetch on filter change (UNCHANGED)
  useEffect(() => {
    if (!loading) fetchProducts();
  }, [selectedCategory, search]);

  // Pull-to-refresh (UNCHANGED)
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Clear filters (UNCHANGED)
  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  // Category underline animation (UNCHANGED)
  const categoryIndex = categories.indexOf(selectedCategory);

  useEffect(() => {
    Animated.spring(underlineAnim, {
      toValue: categoryIndex * CATEGORY_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [categoryIndex]);

  // 🎨 STYLED Loading UI (same logic, better visuals)
  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <View className="bg-emerald-50 rounded-3xl p-12 shadow-lg items-center">
          <View className="bg-emerald-100 rounded-full p-6 mb-6">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
          <Text className="text-gray-900 text-2xl font-bold mb-2">
            Loading Market
          </Text>
          <Text className="text-gray-500 text-center text-base">
            Fetching fresh products from farmers...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      {/* 🎨 STYLED Header (same content, better design) */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-4xl font-bold text-gray-900">Market</Text>
          <View className="bg-emerald-500 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">
              {products.length} items
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 text-base">
          Fresh products from trusted farmers
        </Text>
        {/* 🎨 STYLED Error (better visual treatment) */}
        {error && (
          <View className="mt-3 bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
            <Text className="text-red-600 text-sm font-medium">{error}</Text>
          </View>
        )}
      </View>

      {/* 🎨 STYLED Search (added icon placeholder, better padding) */}
      <View className="bg-white rounded-2xl shadow-md px-5 py-4 mb-5 flex-row items-center">
        <Text className="text-gray-400 text-lg mr-3">🔍</Text>
        <TextInput
          placeholder="Search fresh products..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-base text-gray-900"
        />
        {search !== "" && (
          <TouchableOpacity 
            onPress={() => setSearch("")} 
            className="ml-2 bg-gray-100 rounded-full p-1.5"
          >
            <Text className="text-gray-600 text-sm">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🎨 STYLED Categories (emojis, better colors) */}
      <View className="mb-5">
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            const categoryEmojis: Record<string, string> = {
              All: "🌾",
              Vegetables: "🥬",
              Fruits: "🍎",
              Livestock: "🐄",
              Cereals: "🌽",
              Poultry: "🐔",
              Seeds: "🌱",
            };
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                className={`mr-3 px-5 py-3 rounded-full flex-row items-center shadow-sm ${
                  isSelected ? "bg-emerald-500" : "bg-white"
                }`}
                style={{ width: CATEGORY_WIDTH }}
              >
                <Text className="text-base mr-1.5">{categoryEmojis[item]}</Text>
                <Text
                  className={`text-center font-semibold text-xs ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Animated underline (UNCHANGED logic) */}
        <Animated.View
          style={{
            height: 4,
            width: 60,
            backgroundColor: "#10B981",
            borderRadius: 999,
            marginLeft: 18,
            marginTop: 8,
            transform: [{ translateX: underlineAnim }],
          }}
        />
      </View>

      {/* 🎨 Products Grid (better spacing) */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <MarketProductCard product={item} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={() => (
          // 🎨 STYLED Empty State (better visual hierarchy)
          <View className="items-center justify-center py-24 px-6">
            <View className="bg-gray-100 rounded-full p-10 mb-6">
              <Text className="text-6xl">🛒</Text>
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-3">
              No products found
            </Text>
            <Text className="text-gray-500 text-center text-base mb-6 px-4 leading-relaxed">
              Try changing your search or category
            </Text>
            <TouchableOpacity
              onPress={clearFilters}
              className="bg-emerald-500 px-6 py-3 rounded-full shadow-md"
            >
              <Text className="text-white font-semibold">Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}