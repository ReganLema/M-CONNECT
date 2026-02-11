// src/screens/farmer/AddProductScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import AppButton from "@/components/common/AppButton";
import api from "@/services/productsapi";
import { useNavigation } from "@react-navigation/native";

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

export default function AddProductScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    quantity: "",
    location: "",
    description: "",
  });

  // Function to pick image from gallery
  const pickImage = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
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
    }
  };

  // Validation function
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

  // Reset form function
  const resetForm = () => {
    setForm({
      name: "",
      category: "Vegetables",
      price: "",
      quantity: "",
      location: "",
      description: "",
    });
    setImage(null);
    setSuccess(false);
  };

  // Main save function with API integration - FIXED VERSION
  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add all form fields
      formData.append('name', form.name.trim());
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('quantity', form.quantity.trim());
      
      // Optional fields
      if (form.location.trim()) {
        formData.append('location', form.location.trim());
      }
      
      if (form.description.trim()) {
        formData.append('description', form.description.trim());
      }
      
      // Add image if exists
      if (image) {
        const filename = image.split('/').pop() || 'product.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: image,
          name: filename,
          type: type,
        } as any);
      }

      console.log('🔄 Sending product data to API...');

      // Make API call
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📦 API Response:', response.data);

      // Handle successful response
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        
        // Check different possible success response structures
        if (response.data?.status === 'success' || response.data?.id) {
          Alert.alert(
            'Success ✅',
            response.data?.message || 'Product added successfully!',
            [
              {
                text: 'Add Another',
                onPress: resetForm,
                style: 'default'
              },
              {
                text: 'View Products',
                onPress: () => navigation.goBack(),
                style: 'cancel'
              }
            ]
          );
        } else {
          // Generic success if we get 200/201 but unexpected response format
          Alert.alert('Success', 'Product added successfully!');
          setTimeout(() => {
            resetForm();
            navigation.goBack();
          }, 1500);
        }
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('❌ Detailed error adding product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // User-friendly error messages
      let errorMessage = 'Failed to add product. Please try again.';
      
      if (error.response?.data) {
        const serverError = error.response.data;
        
        // Laravel validation errors
        if (serverError.errors) {
          const firstError = Object.values(serverError.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        } 
        // Laravel error message
        else if (serverError.message) {
          errorMessage = serverError.message;
        }
        // Plain text error
        else if (typeof serverError === 'string') {
          errorMessage = serverError;
        }
      } 
      // Network errors
      else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } 
      // Timeout
      else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }
      // No response
      else if (!error.response) {
        errorMessage = 'No response from server. Please check if the server is running.';
      }
      
      Alert.alert('Error ❌', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format price input
  const handlePriceChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setForm({ ...form, price: numericText });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Add New Product
      </Text>

      {/* ================= IMAGE CARD ================= */}
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.8}
        className="bg-white rounded-3xl h-44 mb-5 shadow items-center justify-center overflow-hidden border-2 border-dashed border-gray-300"
      >
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center p-4">
            <Text className="text-5xl mb-2">📸</Text>
            <Text className="text-gray-600 font-medium mb-1">
              Upload Product Image
            </Text>
            <Text className="text-gray-400 text-center text-sm">
              Tap to select from gallery
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              Recommended: Square image, max 2MB
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Image preview info */}
      {image && (
        <TouchableOpacity
          onPress={() => setImage(null)}
          className="self-end mb-3"
        >
          <Text className="text-red-500 text-sm">Remove Image</Text>
        </TouchableOpacity>
      )}

      {/* ================= FORM CARD ================= */}
      <View className="bg-white rounded-3xl p-5 shadow mb-6">
        {/* Product Name */}
        <Text className="text-gray-700 font-medium mb-2">
          Product Name <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          placeholder="e.g., Fresh Tomatoes, Organic Eggs"
          className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
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
                style={{ fontSize: 16 }}
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
              placeholder="2500"
              keyboardType="numeric"
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              value={form.price}
              onChangeText={handlePriceChange}
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
              placeholder="e.g., 20 Kg, 100 Pieces"
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              value={form.quantity}
              onChangeText={(v) => setForm({ ...form, quantity: v })}
            />
          </View>
        </View>

        {/* Location */}
        <Text className="text-gray-700 font-medium mb-2">Location</Text>
        <TextInput
          placeholder="e.g., Arusha, Kilimanjaro, Dodoma"
          className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
          value={form.location}
          onChangeText={(v) => setForm({ ...form, location: v })}
        />

        {/* Description */}
        <Text className="text-gray-700 font-medium mb-2">Description</Text>
        <TextInput
          placeholder="Describe your product... (optional)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-gray-50 rounded-xl p-4 h-32 border border-gray-200"
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
        />
      </View>

      {/* ================= SAVE BUTTON ================= */}
      <View className="mb-8">
        <AppButton
          title={loading ? "Saving..." : "Save Product"}
          disabled={loading}
          onPress={handleSave}
        />

        {loading && (
          <View className="items-center mt-4">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-500 mt-2">
              Uploading product to server...
            </Text>
          </View>
        )}

        {success && (
          <View className="bg-green-50 p-4 rounded-xl mt-4 border border-green-200">
            <Text className="text-green-700 font-semibold text-center">
              ✅ Product saved successfully!
            </Text>
          </View>
        )}
      </View>

      {/* Required fields note */}
      <Text className="text-gray-500 text-sm text-center mb-4">
        Fields marked with <Text className="text-red-500">*</Text> are required
      </Text>
    </ScrollView>
  );
}