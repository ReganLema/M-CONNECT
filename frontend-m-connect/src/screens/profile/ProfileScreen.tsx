


// src/screens/profile/ProfileScreen.tsx


import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { JSX, useState, useEffect, useCallback, useRef } from "react";
import { 
  Image, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { 
  ArrowRight, 
  User, 
  ShoppingBag, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Camera,
  Moon,
  Mail,
  Phone,
  Shield
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { uploadProfileImage } from "@/api/user";
import { useFocusEffect } from "@react-navigation/native";

export type ProfileStackParamList = {
  EditProfile: undefined;
  MyOrders: undefined;
  Settings: undefined;
  HelpCenter: undefined;
};

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user: authUser, logout, refreshAuth, updateAuthUser } = useAuth();
  const { user: profileUser, updateAvatar, refreshUser } = useUser();
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  //  CRITICAL FIX: Track last refresh time to prevent loops
  const lastRefreshTime = useRef<number>(0);
  const isMounted = useRef(true);

   
    // FIXED: REFRESH ON FOCUS WITHOUT LOOP
  
  useFocusEffect(
    useCallback(() => {
      console.log("ProfileScreen focused");
      
      // Set mounted flag
      isMounted.current = true;
      
      const refreshProfileData = async () => {
        if (!isMounted.current) return;
        
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime.current;
        
        //  Only refresh if at least 5 seconds have passed since last refresh
        if (timeSinceLastRefresh < 5000) {
          console.log("Skipping refresh - too soon since last refresh:", timeSinceLastRefresh, "ms");
          return;
        }
        
        if (refreshing) return;
        
        setRefreshing(true);
        lastRefreshTime.current = now;
        
        console.log("Refreshing profile data...");
        
        try {
          // Use Promise.allSettled to handle individual errors gracefully
          const results = await Promise.allSettled([
            refreshAuth(),
            refreshUser(),
          ]);
          
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Refresh ${index === 0 ? 'auth' : 'user'} failed:`, result.reason);
            }
          });
          
          console.log("Profile data refreshed successfully");
        } catch (error) {
          console.error("Error refreshing profile:", error);
        } finally {
          if (isMounted.current) {
            setRefreshing(false);
          }
        }
      };
      
      refreshProfileData();
      
      // Cleanup function
      return () => {
        isMounted.current = false;
      };
    }, [refreshAuth, refreshUser, refreshing])
  );

  
   //  LOGOUT HANDLER
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() }
      ]
    );
  };


  
    // IMAGE PICKER
  
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

  
   //  IMAGE UPLOAD HANDLER

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
      
      //  CRITICAL: Update both contexts immediately
      updateAuthUser({ avatar: avatarUrl }); // Update AuthContext
      updateAvatar(avatarUrl); // Update UserContext
      
      Alert.alert('Success', 'Profile picture updated successfully!');
      
      //  FIXED: Don't call refreshAuth/refreshUser here - they're already updated
      // Just mark that we need to refresh next time

      lastRefreshTime.current = 0; // Reset so next focus will refresh
      
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

  
     //GET AVATAR URL
  
  const getAvatarUrl = useCallback(() => {
    const currentUserId = authUser?.id;
    const timestamp = Date.now();
    
    //  Priority 1: AuthContext avatar (always fresh)
    if (authUser?.avatar) {
      const cleanUrl = authUser.avatar.split('?')[0];
      return `${cleanUrl}?t=${timestamp}&auth=1`;
    }
    
    //  Priority 2: UserContext avatar (should match auth)
    if (profileUser?.avatar && profileUser.id === currentUserId) {
      const cleanUrl = profileUser.avatar.split('?')[0];
      return `${cleanUrl}?t=${timestamp}&user=1`;
    }
    
    // Generate from name if available
    if (authUser?.name) {
      const cleanName = authUser.name.trim().replace(/\s+/g, '+');
      return `https://ui-avatars.com/api/?name=${cleanName}&background=0D8ABC&color=fff&size=256&bold=true&t=${timestamp}`;
    }
    
    // Default avatar
    return `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=256&t=${timestamp}`;
  }, [authUser, profileUser]);

  
   //  DISPLAY DATA
  
  const avatarUrl = getAvatarUrl();
  const displayName = profileUser?.name || authUser?.name || "User";
  const displayEmail = profileUser?.email || authUser?.email || "-";
  const displayRole = profileUser?.role || authUser?.role || "buyer";

  return (
    <ScrollView 
      className="flex-1 bg-gray-100"
      refreshControl={
        refreshing ? (
          <RefreshControl
            refreshing={refreshing}
            colors={["#4c6ef5"]}
            tintColor="#4c6ef5"
          />
        ) : undefined
      }
    >
      {/* Header Gradient Background */}
      <LinearGradient
        colors={["#4c6ef5", "#15aabf"]}
        className="px-5 pb-10 pt-16 rounded-b-3xl"
      >
        <View className="items-center">
          {/* Profile Picture Container */}
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
                resizeMode="cover"
                key={`avatar-${authUser?.id}-${Date.now()}`}
              />
              {uploading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-full">
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
            
            {/* Camera Button */}
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading || refreshing}
              className={`absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-2 border-blue-500 shadow-md ${
                uploading || refreshing ? 'bg-gray-300' : 'bg-white'
              }`}
              style={{ elevation: 3 }}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#4c6ef5" />
              ) : (
                <Camera size={18} color="#4c6ef5" />
              )}
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text className="text-white text-2xl font-bold mt-4">
            {displayName}
          </Text>
          <Text className="text-white/90 mt-1">{displayEmail}</Text>

          {/*  PHONE NUMBER DISPLAY */}
            {(authUser?.phone || profileUser?.phone) && (
            <View className="flex-row items-center mt-2">
               <Phone size={16} color="rgba(255,255,255,0.8)" />
                   <Text className="text-white/90 ml-2">
                {profileUser?.phone || authUser?.phone}
             </Text>
             </View>
           )}
          
          {/* User Role Badge */}
          {displayRole && (
            <View className={`mt-2 px-4 py-1 rounded-full ${displayRole === 'farmer' ? 'bg-emerald-500' : 'bg-blue-400'}`}>
              <Text className="text-white text-xs font-semibold">
                {displayRole === 'farmer' ? 'FARMER' : 'BUYER'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="p-5 -mt-10">
        {/* Card Menu */}
        <View className="bg-white rounded-3xl p-5 shadow-md">
          <SectionTitle title="Account" />

          <MenuItem
            icon={<User size={22} color="#555" />}
            label="Edit Profile"
            onPress={() => navigation.navigate("EditProfile")}
            disabled={refreshing}
          />
          <MenuItem
            icon={<ShoppingBag size={22} color="#555" />}
            label="My Orders"
            onPress={() => navigation.getParent()?.navigate("Orders")}
            disabled={refreshing}
          />

          <SectionTitle title="Preferences" className="mt-6" />

          <MenuItem
            icon={<Settings size={22} color="#555" />}
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            disabled={refreshing}
          />

          <MenuItem
            icon={<HelpCircle size={22} color="#555" />}
            label="Help Center"
            onPress={() => navigation.navigate("HelpCenter")}
            isLast
            disabled={refreshing}
          />
        </View>


        {/* Account Info Card */}
        <View className="bg-white rounded-3xl p-5 shadow-md mt-6">
          <SectionTitle title="Account Information" />
          
          <View className="space-y-3">
            <InfoRow 
              icon={<User size={18} color="#666" />}
              label="Name"
              value={displayName}
            />
            <InfoRow 
              icon={<Mail size={18} color="#666" />}
              label="Email"
              value={displayEmail}
            />

            <InfoRow 
             icon={<Phone size={18} color="#666" />}
             label="Phone"
             value={profileUser?.phone || authUser?.phone || "Not set"}
             />
          
            <InfoRow 
              icon={<Shield size={18} color="#666" />}
              label="Account Type"
              value={displayRole === 'farmer' ? 'Farmer Account' : 'Buyer Account'}
              isLast
            />
          </View>
        </View>

        

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout} 
          className="mt-8"
          disabled={uploading || refreshing}
        >
          <LinearGradient
            colors={["#ff6b6b", "#fa5252"]}
            className={`py-4 rounded-2xl shadow flex-row items-center justify-center ${
              uploading || refreshing ? 'opacity-50' : ''
            }`}
            style={{ elevation: 3 }}
          >
            <LogOut size={22} color="white" />
            <Text className="text-center text-white font-semibold text-lg ml-2">
              {uploading ? 'Uploading...' : refreshing ? 'Refreshing...' : 'Logout'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


// REUSABLE COMPONENTS


const SectionTitle = ({ title, className = "" }: { title: string; className?: string }) => (
  <Text className={`text-gray-700 font-semibold text-base mb-3 ${className}`}>
    {title}
  </Text>
);

// Update MenuItem to accept disabled prop
const MenuItem = ({
  label,
  icon,
  onPress,
  isLast,
  disabled = false,
}: {
  label: string;
  icon: JSX.Element;
  onPress: () => void;
  isLast?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`flex-row justify-between items-center py-4 ${
      !isLast ? "border-b border-gray-200" : ""
    } ${disabled ? 'opacity-50' : ''}`}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center space-x-3">
      {icon}
      <Text className="text-lg text-gray-800">{label}</Text>
    </View>

    <ArrowRight size={20} color="#999" />
  </TouchableOpacity>
);

const InfoRow = ({
  icon,
  label,
  value,
  isLast = false
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View className={`flex-row items-center justify-between py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <View className="flex-row items-center space-x-3">
      {icon}
      <Text className="text-gray-600">{label}</Text>
    </View>
    <Text className="text-gray-800 font-medium">{value}</Text>
  </View>
);