// src/screens/farmer/EditProductScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ImagePlus, Trash2, Save, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import api from "@/services/productsapi";

// Category options
const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Cereals',
  'Livestock',
  'Dairy',
  'Poultry',
  'Spices',
  'Other'
];

type RouteParams = {
  productId: number;
};

export default function EditProductScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    quantity: "",
    location: "",
    description: "",
  });

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

  // Fetch product data on mount
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Fetch product from API
  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching product with ID: ${productId}`);
      
      const response = await api.get(`/products/${productId}`);
      
      // Safely parse the response data
      const parsedData = safeJsonParse(response.data);
      
      if (!parsedData) {
        console.log('⚠️ Failed to parse API response');
        throw new Error('Failed to parse product data');
      }
      
      if (parsedData.status === 'success') {
        const product = parsedData.data;
        
        setForm({
          name: product.name || "",
          category: product.category || "Vegetables",
          price: product.price?.toString() || "",
          quantity: product.quantity || "",
          location: product.location || "",
          description: product.description || "",
        });
        
        if (product.image) {
          setImage(product.image);
          setOriginalImage(product.image);
        }
        
        console.log('✅ Product loaded successfully:', product.name);
      } else {
        throw new Error(parsedData.message || 'Failed to load product');
      }
    } catch (error: any) {
      console.error('❌ Detailed error fetching product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'Failed to load product.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Product not found.';
      } else if (error.response?.data) {
        const parsedError = safeJsonParse(error.response.data);
        if (parsedError?.message) {
          errorMessage = parsedError.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageChanged(true);
        console.log('📸 New image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    setImageChanged(true);
  };

  // Validation
  const validate = () => {
    if (!form.name.trim()) {
      Alert.alert("Missing Fields", "Please enter product name");
      return false;
    }
    
    const priceNum = parseFloat(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return false;
    }
    
    if (!form.quantity.trim()) {
      Alert.alert("Missing Fields", "Please enter quantity");
      return false;
    }
    
    return true;
  };

  // ✅ FIXED: Update product with proper image handling
  const handleUpdate = async () => {
    if (!validate()) return;

    setUpdating(true);

    try {
      console.log('🔄 UPDATE ATTEMPT for product:', productId);
      
      // Create FormData
      const formData = new FormData();
      
      // Add all fields - use 'filled' check for Laravel 'sometimes' validation
      if (form.name.trim()) formData.append('name', form.name.trim());
      if (form.category) formData.append('category', form.category);
      if (form.price) formData.append('price', form.price);
      if (form.quantity.trim()) formData.append('quantity', form.quantity.trim());
      if (form.location.trim()) formData.append('location', form.location.trim());
      if (form.description.trim()) formData.append('description', form.description.trim());
      
      // CRITICAL: Add _method=PUT for Laravel to handle PUT via POST
      formData.append('_method', 'PUT');
      
      // ✅ FIXED: Handle image properly
      if (imageChanged) {
        if (image) {
          // Check if this is a new image (starts with file://) or existing URL
          if (image.startsWith('file://')) {
            // This is a new image from camera/gallery
            const filename = image.split('/').pop() || 'product.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            
            // Append as file, not string
            formData.append('image', {
              uri: image,
              name: filename,
              type: type,
            } as any);
            console.log('📸 Adding NEW image file:', filename);
          } else if (image.startsWith('http')) {
            // This is an existing image URL from CDN - don't send it back
            // Laravel already has this image, so we don't need to send anything
            console.log('🖼️ Keeping existing image (not sending file)');
            // Don't append image field at all
          }
        } else {
          // User wants to remove image - send empty string
          formData.append('image', '');
          console.log('🗑️ Removing image (sending empty string)');
        }
      } else {
        // Image not changed - don't send image field at all
        // This tells Laravel to keep the existing image
        console.log('🖼️ Image unchanged - not sending image field');
      }

      // Log FormData contents for debugging
      console.log('📤 Sending update via POST with _method=PUT');
      // @ts-ignore - for debugging FormData internals
      if (formData._parts) {
        // @ts-ignore
        formData._parts.forEach(([key, value]) => {
          if (key === 'image' && value?.uri) {
            console.log(`  ${key}: [FILE] ${value.name}`);
          } else if (key === 'image' && value === '') {
            console.log(`  ${key}: [EMPTY STRING - REMOVE]`);
          } else if (key === 'image') {
            console.log(`  ${key}: [SKIPPED - KEEP EXISTING]`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        });
      }
      
      // Use POST with _method=PUT (most reliable for Laravel with file uploads)
      const response = await api.post(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      console.log('✅ Update response status:', response.status);
      
      // Parse response
      const parsedResponse = safeJsonParse(response.data);
      console.log('📦 Update response data:', parsedResponse);

      if (parsedResponse?.status === 'success') {
        // Verify the data actually changed
        const updatedProduct = parsedResponse.data;
        console.log('✅ Product updated:', {
          name: updatedProduct.name,
          price: updatedProduct.price,
          image: updatedProduct.image ? 'has image' : 'no image'
        });
        
        Alert.alert(
          'Success ✅',
          'Product updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back and refresh products
                navigation.goBack();
                setTimeout(() => {
                  navigation.getParent()?.navigate('Products', { 
                    refresh: true,
                    timestamp: Date.now()
                  });
                }, 100);
              }
            }
          ]
        );
      } else {
        throw new Error(parsedResponse?.message || 'Update failed');
      }
      
    } catch (error: any) {
      console.error('❌ Update error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      let errorMessage = 'Failed to update product. Please try again.';
      
      if (error.response?.data) {
        const parsedError = safeJsonParse(error.response.data);
        if (parsedError?.message) {
          errorMessage = parsedError.message;
        } else if (parsedError?.errors) {
          // Handle validation errors
          const errors = parsedError.errors;
          const firstError = Object.values(errors)[0] as string[];
          errorMessage = firstError?.[0] || errorMessage;
        }
      }
      
      Alert.alert('Error ❌', errorMessage);
      
    } finally {
      setUpdating(false);
    }
  };

  // Delete product
  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteProduct,
        },
      ]
    );
  };

  const deleteProduct = async () => {
    try {
      setDeleting(true);
      
      console.log(`🗑️ Deleting product ${productId}...`);
      const response = await api.delete(`/products/${productId}`);
      
      // Parse the response safely
      const parsedResponse = safeJsonParse(response.data);
      
      if (parsedResponse?.status === 'success') {
        Alert.alert(
          "Deleted ✅",
          "Product deleted successfully",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(parsedResponse?.message || 'Failed to delete product');
      }
      
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      
      let errorMessage = 'Failed to delete product. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Product not found. It may have been already deleted.';
      } else if (error.response?.data) {
        const parsedError = safeJsonParse(error.response.data);
        if (parsedError?.message) {
          errorMessage = parsedError.message;
        }
      }
      
      Alert.alert('Error ❌', errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-500 mt-4">Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
      {/* ================= HEADER ================= */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Edit Product
      </Text>
      <Text className="text-gray-500 mb-6">
        Update your product details
      </Text>

      {/* ================= IMAGE SECTION ================= */}
      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">Product Image</Text>
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.8}
          className="bg-white rounded-3xl h-44 items-center justify-center overflow-hidden border-2 border-dashed border-gray-300"
        >
          {image ? (
            <View className="relative w-full h-full">
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={removeImage}
                className="absolute top-3 right-3 bg-red-500 p-2 rounded-full"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center p-4">
              <ImagePlus size={36} color="#10B981" />
              <Text className="text-emerald-600 font-semibold mt-2">
                Add Product Image
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Tap to select from gallery
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {!image && (
          <Text className="text-gray-400 text-xs mt-2 text-center">
            Current product has no image
          </Text>
        )}
      </View>

      {/* ================= FORM CARD ================= */}
      <View className="bg-white rounded-3xl p-5 shadow-sm mb-6">
        {/* Product Name */}
        <Text className="text-gray-700 font-medium mb-2">
          Product Name <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
          placeholder="Enter product name"
        />

        {/* Category */}
        <Text className="text-gray-700 font-medium mb-2">
          Category <Text className="text-red-500">*</Text>
        </Text>
        <View className="bg-gray-50 rounded-xl mb-4 border border-gray-200 overflow-hidden">
          <Picker
            selectedValue={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
            dropdownIconColor="#6b7280"
          >
            {CATEGORIES.map(cat => (
              <Picker.Item 
                key={cat} 
                label={cat} 
                value={cat} 
              />
            ))}
          </Picker>
        </View>

        {/* Price & Quantity */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 font-medium mb-2">
              Price (TZS) <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={form.price}
              keyboardType="numeric"
              onChangeText={(v) => setForm({ ...form, price: v.replace(/[^0-9]/g, '') })}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              placeholder="Price"
            />
            {form.price ? (
              <Text className="text-gray-500 text-sm mt-1">
                {parseInt(form.price || '0').toLocaleString()} TZS
              </Text>
            ) : null}
          </View>

          <View className="flex-1">
            <Text className="text-gray-700 font-medium mb-2">
              Quantity <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={form.quantity}
              onChangeText={(v) => setForm({ ...form, quantity: v })}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              placeholder="e.g., 20 Kg, 100 Pieces"
            />
          </View>
        </View>

        {/* Location */}
        <Text className="text-gray-700 font-medium mb-2">Location</Text>
        <TextInput
          value={form.location}
          onChangeText={(v) => setForm({ ...form, location: v })}
          className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
          placeholder="e.g., Arusha, Kilimanjaro"
        />

        {/* Description */}
        <Text className="text-gray-700 font-medium mb-2">Description</Text>
        <TextInput
          value={form.description}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onChangeText={(v) => setForm({ ...form, description: v })}
          className="bg-gray-50 rounded-xl p-4 h-32 border border-gray-200"
          placeholder="Describe your product..."
        />
      </View>

      {/* ================= ACTION BUTTONS ================= */}
      <View className="mb-8">
        {/* Update Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={updating}
          activeOpacity={0.85}
          className={`bg-green-600 py-4 rounded-full mb-4 flex-row justify-center items-center ${updating ? 'opacity-70' : ''}`}
        >
          {updating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Save size={20} color="white" />
          )}
          <Text className="text-white font-semibold text-base ml-2">
            {updating ? "Updating..." : "Update Product"}
          </Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
          className={`py-4 rounded-full border border-red-200 bg-red-50 flex-row justify-center items-center ${deleting ? 'opacity-70' : ''}`}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Trash2 size={20} color="#DC2626" />
          )}
          <Text className="text-red-600 font-semibold text-base ml-2">
            {deleting ? "Deleting..." : "Delete Product"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Required fields note */}
      <Text className="text-gray-500 text-sm text-center mb-4">
        Fields marked with <Text className="text-red-500">*</Text> are required
      </Text>
    </ScrollView>
  );
}