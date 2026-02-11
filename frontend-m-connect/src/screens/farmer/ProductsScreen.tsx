// src/screens/farmer/ProductsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Plus, Pencil, Trash2 } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "@/services/productsapi";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
  quantity: string;
  location: string;
  description: string;
  created_at: string;
  formatted_price?: string;
};

const FarmerProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Helper function to remove BOM from JSON string
  const removeBOM = (str: string) => {
    if (str.charCodeAt(0) === 0xFEFF) {
      return str.slice(1);
    }
    return str;
  };

  // Parse JSON response safely
  const safeJsonParse = (responseData: any) => {
    try {
      // If responseData is already an object, return it
      if (typeof responseData === 'object' && responseData !== null) {
        return responseData;
      }
      
      // If it's a string, try to parse it
      if (typeof responseData === 'string') {
        // Remove BOM character if present
        const cleanString = removeBOM(responseData);
        return JSON.parse(cleanString);
      }
      
      // If it's neither string nor object, return null
      return null;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products...');
      
      const response = await api.get('/products');
      
      // Safely parse the response data
      const parsedData = safeJsonParse(response.data);
      
      if (!parsedData) {
        console.log('⚠️ Failed to parse API response');
        setProducts([]);
        return;
      }
      
      let productsArray = [];
      
      // Check the structure of the parsed data
      if (parsedData.status === 'success') {
        // Check for products in different possible locations
        if (parsedData.data?.products && Array.isArray(parsedData.data.products)) {
          productsArray = parsedData.data.products;
        } else if (Array.isArray(parsedData.data)) {
          productsArray = parsedData.data;
        } else if (Array.isArray(parsedData.products)) {
          productsArray = parsedData.products;
        }
      } else if (Array.isArray(parsedData)) {
        // Direct array response
        productsArray = parsedData;
      }
      
      console.log(`✅ Found ${productsArray.length} products`);
      
      // Transform to our format
      const productsData = productsArray.map((product: any) => ({
        id: product.id || 0,
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        image: product.image || product.image_url || null,
        category: product.category || 'Uncategorized',
        quantity: product.quantity || '',
        location: product.location || '',
        description: product.description || '',
        created_at: product.created_at || new Date().toISOString(),
        formatted_price: product.formatted_price || 
                        `Tsh ${(product.price || 0).toLocaleString()}`,
      }));
      
      setProducts(productsData);
      
    } catch (error: any) {
      console.error('❌ Error fetching products:', error.message);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to remove this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProduct(id),
        },
      ]
    );
  };

  const deleteProduct = async (id: number) => {
    try {
      setDeletingId(id);
      
      const response = await api.delete(`/products/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        // Remove product from local state
        setProducts(prev => prev.filter(p => p.id !== id));
        
        // Show success message
        Alert.alert('Success', 'Product deleted successfully');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      let errorMessage = 'Failed to delete product. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Product not found. It may have been already deleted.';
        // Refresh list
        fetchProducts();
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    navigation.navigate("EditProduct", { productId: product.id });
  };

  // Render product item
  const renderItem = ({ item }: { item: Product }) => (
    <View className="bg-white rounded-3xl mb-5 shadow-sm overflow-hidden">
      {/* Image with fallback */}
      <View className="relative">
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            className="h-48 w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-48 w-full bg-gray-200 items-center justify-center">
            <Text className="text-gray-500 text-lg">No Image</Text>
            <Text className="text-gray-400 text-sm mt-1">📷</Text>
          </View>
        )}

        {/* Category Badge */}
        <View className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-500/90">
          <Text className="text-white text-xs font-semibold">
            {item.category}
          </Text>
        </View>

        {/* Quantity Badge */}
        <View className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gray-800/90">
          <Text className="text-white text-xs font-semibold">
            {item.quantity}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.name}
            </Text>
            
            {item.location && (
              <Text className="text-gray-500 text-sm mt-1">
                📍 {item.location}
              </Text>
            )}
          </View>
          
          <Text className="text-green-600 font-bold text-lg">
            {item.formatted_price || `Tsh ${item.price.toLocaleString()}`}
          </Text>
        </View>

        {item.description && (
          <Text 
            className="text-gray-600 mt-3 text-sm"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        {/* Created date */}
        <Text className="text-gray-400 text-xs mt-3">
          Added on {new Date(item.created_at).toLocaleDateString()}
        </Text>

        {/* Divider */}
        <View className="h-px bg-gray-100 my-4" />

        {/* Actions */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="flex-row items-center"
          >
            <Pencil size={18} color="#2563EB" />
            <Text className="text-blue-600 ml-2 font-medium">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={deletingId === item.id}
            onPress={() => handleDelete(item.id)}
            className="flex-row items-center"
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Trash2 size={18} color="#DC2626" />
            )}
            <Text className="text-red-600 ml-2 font-medium">
              {deletingId === item.id ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-500 mt-4">Loading your products...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900">
          My Products
        </Text>
        <Text className="text-gray-500 mt-1">
          {products.length} product{products.length !== 1 ? 's' : ''} listed
        </Text>
      </View>

      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <Text className="text-5xl mb-4">📦</Text>
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              No products yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Start selling by adding your first product
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddProduct")}
              className="bg-green-600 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">
                Add First Product
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10b981']}
              tintColor="#10b981"
            />
          }
        />
      )}

      {/* Floating Add Product Button - Always show */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddProduct")}
        activeOpacity={0.85}
        className="absolute bottom-6 right-6"
      >
        <View className="rounded-full overflow-hidden shadow-xl">
          <View className="bg-green-600 h-14 w-14 items-center justify-center">
            <Plus size={26} color="white" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FarmerProductsScreen;