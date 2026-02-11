

// src/screens/farmer/profile/EditProfileScreen.tsx


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  User,
  MapPin,
  Phone,
  Store,
  Save,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { updateFarmerProfile } from "@/api/user";

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user: authUser, refreshAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    farm_name: "",
    location: "",
    phone: "",
    farm_description: "",
    farm_size: "",
    specialty: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Get farmer data from navigation params or auth context
  useEffect(() => {
    // Type assertion for route.params
    const params = route.params as any;
    
    // Check if we have farmer data from navigation params
    if (params?.farmerData) {
      const farmerData = params.farmerData;
      setFormData({
        farm_name: farmerData.farm_name || "",
        location: farmerData.location || "",
        phone: farmerData.phone || "",
        farm_description: farmerData.farm_description || "",
        farm_size: farmerData.farm_size || "",
        specialty: farmerData.specialty || "",
      });
    } else if (authUser) {
      // Type assertion for authUser to access farmer properties
      const user = authUser as any;
      setFormData({
        farm_name: user.farm_name || user.name || "",
        location: user.location || "",
        phone: user.phone || "",
        farm_description: user.farm_description || "",
        farm_size: user.farm_size || "",
        specialty: user.specialty || "",
      });
    }
    setInitialLoading(false);
  }, [route.params, authUser]);

  const handleSave = async () => {
    if (!authUser?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    // Basic validation
    if (!formData.farm_name.trim()) {
      Alert.alert('Validation Error', 'Farm name is required');
      return;
    }

    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Location is required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return;
    }

    setLoading(true);

    try {
      // Call API to update farmer profile
      await updateFarmerProfile(authUser.id, formData);
      
      // Refresh auth context to get updated data
      await refreshAuth();
      
      // Get the callback function from navigation params to trigger refresh
      const params = route.params as any;
      if (params?.onProfileUpdated) {
        params.onProfileUpdated();
      }
      
      Alert.alert(
        'Success', 
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to trigger auto-refresh
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (initialLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-gray-600">Loading profile data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-6">
      {/* Header */}
      <Text className="text-2xl font-bold mb-6 text-gray-900">Edit Farm Profile</Text>

      {/* Form Card */}
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Farm Name */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Farm Name *
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
            <Store size={18} color="#6B7280" />
            <TextInput
              value={formData.farm_name}
              onChangeText={(value) => handleInputChange('farm_name', value)}
              placeholder="Enter your farm name"
              className="flex-1 ml-3 py-3 text-gray-800"
              editable={!loading}
            />
          </View>
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Location *
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
            <MapPin size={18} color="#6B7280" />
            <TextInput
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="e.g., Arusha, Tanzania"
              className="flex-1 ml-3 py-3 text-gray-800"
              editable={!loading}
            />
          </View>
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Phone Number *
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
            <Phone size={18} color="#6B7280" />
            <TextInput
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+255 XXX XXX XXX"
              keyboardType="phone-pad"
              className="flex-1 ml-3 py-3 text-gray-800"
              editable={!loading}
            />
          </View>
        </View>

        {/* Farm Size */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Farm Size
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
            <User size={18} color="#6B7280" />
            <TextInput
              value={formData.farm_size}
              onChangeText={(value) => handleInputChange('farm_size', value)}
              placeholder="e.g., 5 acres, 2 hectares"
              className="flex-1 ml-3 py-3 text-gray-800"
              editable={!loading}
            />
          </View>
        </View>

        {/* Specialty */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Specialty / Main Products
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
            <Store size={18} color="#6B7280" />
            <TextInput
              value={formData.specialty}
              onChangeText={(value) => handleInputChange('specialty', value)}
              placeholder="e.g., Organic Vegetables, Coffee, Fruits"
              className="flex-1 ml-3 py-3 text-gray-800"
              editable={!loading}
            />
          </View>
        </View>

        {/* Farm Description */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">
            Farm Description
          </Text>
          <TextInput
            value={formData.farm_description}
            onChangeText={(value) => handleInputChange('farm_description', value)}
            placeholder="Tell buyers about your farm, practices, etc."
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            loading ? "bg-green-300" : "bg-green-500"
          } shadow-sm`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Save size={20} color="white" />
          )}
          <Text className="text-white ml-2 font-semibold text-lg">
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Note */}
      <View className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Text className="text-blue-700 text-sm">
          ℹ️ Required fields are marked with *. Updating location or phone number may reset your verification status.
        </Text>
      </View>

      {/* Verification Note - using type assertion */}
      {(!((authUser as any)?.is_verified)) && (
        <View className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <Text className="text-yellow-700 text-sm">
            ⚠️ Note: Changing location or phone number will reset your verification status to "pending". Complete verification after updating.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default EditProfileScreen;