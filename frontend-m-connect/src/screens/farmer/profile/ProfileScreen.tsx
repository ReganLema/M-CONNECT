// src/screens/farmer/profile/ProfileScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Edit3,
  MapPin,
  Phone,
  CheckCircle,
  BarChart3,
  Wallet,
  ShieldCheck,
  Settings,
  ChevronRight,
  Camera,
} from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage, getFarmerProfile } from "@/api/user";

const FarmerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user: authUser, refreshAuth, updateAuthUser } = useAuth();
  const { user: profileUser, updateAvatar, refreshUser } = useUser();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farmerData, setFarmerData] = useState({
    farmName: "",
    location: "",
    phone: "",
    isVerified: false,
    verificationStatus: "pending", // pending, under_review, verified
     avatar: undefined as string | undefined,
  });


// Add this useEffect in FarmerProfileScreen.tsx
useEffect(() => {
  const checkAndFixAvatar = async () => {
    if (authUser?.avatar && !authUser.avatar.includes('r2.dev')) {
      console.log('🔧 Auth avatar still local, forcing fix...');
      const path = authUser.avatar.split('/storage/').pop();
      const cdnUrl = `https://pub-830fc031162b476396c6a260d2baec03.r2.dev/${path}`;
      updateAuthUser({ avatar: cdnUrl });
      await refreshAuth();
    }
  };
  
  checkAndFixAvatar();
}, [authUser?.id]);



  /* FETCH FARMER DATA */
  const fetchFarmerData = useCallback(async () => {
    if (!authUser?.id) return;
    
    try {
      const data = await getFarmerProfile(authUser.id);

      setFarmerData({
        farmName: data.farm_name || authUser?.name || "Farm",
        location: data.location || "Not specified",
        phone: data.phone || "Not specified",
        isVerified: data.is_verified || false,
        verificationStatus: data.verification_status || "pending",
         avatar: data.avatar,
      });

    } catch (error) {
      console.error("Error fetching farmer data:", error);

      // Fallback to auth data

      setFarmerData({
        farmName: authUser?.name || "Farm",
        location: "Not specified",
        phone: "Not specified",
        isVerified: false,
        verificationStatus: "pending",
         avatar: authUser?.avatar
      });
    }
  }, [authUser]);

  /*LOAD DATA */
  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchFarmerData();
    setLoading(false);
  }, [fetchFarmerData]);

  /*EFFECTS */
  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      console.log("FarmerProfileScreen focused, refreshing data...");
      loadData();
      // Refresh user context to ensure avatar is up to date
      refreshUser();
    }, [loadData, refreshUser])
  );


  /* PULL TO REFRESH */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFarmerData(),
      refreshUser(),
      refreshAuth(),
    ]);
    setRefreshing(false);
  }, [fetchFarmerData, refreshUser, refreshAuth]);


  /* GET AVATAR URL */
  const getAvatarUrl = useCallback(() => {
    const currentUserId = authUser?.id;
    const timestamp = Date.now();
    
    // ✅ FIXED: Check if avatar is already a full URL (from CDN)
    if (authUser?.avatar) {
      // If it's already a full URL (starts with http), use it directly
      if (authUser.avatar.startsWith('http')) {
        return `${authUser.avatar.split('?')[0]}?t=${timestamp}`;
      }
      // Otherwise, construct CDN URL
      const cleanUrl = authUser.avatar.split('?')[0];
      return `https://pub-830fc031162b476396c6a260d2baec03.r2.dev/${cleanUrl}?t=${timestamp}`;
    }
    
    //  Priority 2: UserContext avatar (should match auth)
    if (profileUser?.avatar && profileUser.id === currentUserId) {
      if (profileUser.avatar.startsWith('http')) {
        return `${profileUser.avatar.split('?')[0]}?t=${timestamp}`;
      }
      const cleanUrl = profileUser.avatar.split('?')[0];
      return `https://pub-830fc031162b476396c6a260d2baec03.r2.dev/${cleanUrl}?t=${timestamp}`;
    }
    
    // Generate from farm name if available
    if (farmerData.farmName) {
      const cleanName = farmerData.farmName.trim().replace(/\s+/g, '+');
      return `https://ui-avatars.com/api/?name=${cleanName}&background=22C55E&color=fff&size=128&t=${timestamp}`;
    }
    
    // Default farmer avatar
    return `https://cdn-icons-png.flaticon.com/512/1995/1995525.png?t=${timestamp}`;
  }, [authUser, profileUser, farmerData.farmName]);

  /*IMAGE PICKER */
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      Alert.alert(
        "Update Profile Picture",
        "Choose an option",
        [
          {
            text: "Take Photo",
            onPress: () => launchCamera()
          },
          {
            text: "Choose from Gallery",
            onPress: () => launchImageLibrary()
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const launchCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Camera Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const launchImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  /*HANDLE IMAGE UPLOAD */
  const handleImageSelected = async (imageUri: string) => {
    if (!authUser?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setUploading(true);
    
    try {
      // Upload to server
      const avatarUrl = await uploadProfileImage(authUser.id, imageUri);
      console.log('Upload successful, avatar URL:', avatarUrl);
      
      // ✅ FIXED: Ensure we store the full CDN URL
      const fullAvatarUrl = avatarUrl.startsWith('http') 
        ? avatarUrl 
        : `https://pub-830fc031162b476396c6a260d2baec03.r2.dev/${avatarUrl}`;
      
      // Update both contexts immediately
      updateAuthUser({ avatar: fullAvatarUrl });
      updateAvatar(fullAvatarUrl);
      
      // Refresh from server to ensure consistency
      await Promise.all([
        refreshAuth(),
        refreshUser(),
      ]);
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  /*VERIFICATION HELPERS */
  const getVerificationText = useCallback(() => {
    if (farmerData.isVerified) {
      return "Verified Seller";
    }
    
    switch (farmerData.verificationStatus) {
      case "under_review":
        return "Under Review";
      case "pending":
        return "Not Verified";
      default:
        return "Not Verified";
    }
  }, [farmerData.isVerified, farmerData.verificationStatus]);

  const getVerificationColor = useCallback(() => {
    if (farmerData.isVerified) {
      return "#22C55E";
    }
    
    switch (farmerData.verificationStatus) {
      case "under_review":
        return "#F59E0B";
      case "pending":
        return "#9CA3AF";
      default:
        return "#9CA3AF";
    }
  }, [farmerData.isVerified, farmerData.verificationStatus]);

  // ✅ ADDED: Debug function to log avatar URL
  const debugAvatar = useCallback(() => {
    console.log('👤 Avatar Debug:', {
      authAvatar: authUser?.avatar,
      profileAvatar: profileUser?.avatar,
      finalUrl: getAvatarUrl(),
      userId: authUser?.id
    });
  }, [authUser, profileUser, getAvatarUrl]);

  /*RENDER */
  if (loading && !farmerData.farmName) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
        <Text className="mt-4 text-gray-600">Loading farmer profile...</Text>
      </View>
    );
  }

  const avatarUrl = getAvatarUrl();
  
  // Debug on render
  if (__DEV__) {
    debugAvatar();
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 pt-6"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#22C55E"]}
          tintColor="#22C55E"
        />
      }
    >
      {/* PROFILE HEADER */}
      <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 items-center">
        {/* Avatar Container */}
        <View className="relative">
          <View className="h-24 w-24 rounded-full mb-4 overflow-hidden bg-gray-200">
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
              key={`avatar-${authUser?.id}-${Date.now()}`}
              onError={(e) => console.log('❌ Avatar load error:', e.nativeEvent.error)}
              onLoad={() => console.log('✅ Avatar loaded successfully')}
            />
          </View>
          
          {/* Camera Button Overlay */}
          <TouchableOpacity
            onPress={pickImage}
            disabled={uploading}
            className="absolute bottom-4 right-0 bg-green-500 p-2 rounded-full shadow-md"
            style={{ elevation: 3 }}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Camera size={14} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Farm Name */}
        <Text className="text-2xl font-bold text-gray-900">
          {farmerData.farmName}
        </Text>

        {/* Verification Status */}
        <View className="flex-row items-center mt-1">
          <CheckCircle
            size={16}
            color={getVerificationColor()}
          />
          <Text
            className={`ml-1 text-sm font-medium ${
              farmerData.isVerified 
                ? "text-green-600" 
                : farmerData.verificationStatus === "under_review" 
                  ? "text-yellow-600" 
                  : "text-gray-400"
            }`}
          >
            {getVerificationText()}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center mt-4">
          <MapPin size={18} color="#6B7280" />
          <Text className="text-gray-600 ml-2">
            {farmerData.location}
          </Text>
        </View>

        {/* Phone */}
        <View className="flex-row items-center mt-2">
          <Phone size={18} color="#6B7280" />
          <Text className="text-gray-600 ml-2">
            {farmerData.phone}
          </Text>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("EditFarmerProfile", { 
            farmerData: {
              farm_name: farmerData.farmName,
              location: farmerData.location,
              phone: farmerData.phone,
              is_verified: farmerData.isVerified,
              verification_status: farmerData.verificationStatus,
            },
            onProfileUpdated: fetchFarmerData
          })}
          className="mt-6 bg-green-500 px-6 py-3 rounded-xl flex-row items-center shadow-sm"
          style={{ elevation: 2 }}
        >
          <Edit3 size={18} color="white" />
          <Text className="text-white ml-2 font-semibold">
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <Text className="text-lg font-bold mb-4 text-gray-900">
          Seller Tools
        </Text>

        {/* Verification Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Verification")}
          className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <ShieldCheck size={22} color="#22C55E" />
            <View className="ml-3">
              <Text className="font-medium text-gray-800">
                Verification / KYC
              </Text>
              <Text className="text-xs text-gray-500">
                {farmerData.isVerified
                  ? "Account verified"
                  : farmerData.verificationStatus === "under_review"
                  ? "Under review"
                  : "Complete verification"}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Earnings */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Earnings")}
          className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Wallet size={22} color="#22C55E" />
            <Text className="ml-3 font-medium text-gray-800">
              Earnings
            </Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Analytics */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Analytics")}
          className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <BarChart3 size={22} color="#3B82F6" />
            <Text className="ml-3 font-medium text-gray-800">
              Sales Analytics
            </Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Settings size={22} color="#6B7280" />
            <Text className="ml-3 font-medium text-gray-800">
              Settings
            </Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* NOTICE */}
      {!farmerData.isVerified && (
        <View className="mb-10 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <Text className="text-yellow-700 text-sm">
            {farmerData.verificationStatus === "under_review" 
              ? "🔍 Your verification is under review. You'll be notified once approved."
              : "🔒 Complete verification to unlock full selling features and gain buyer trust."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default FarmerProfileScreen;