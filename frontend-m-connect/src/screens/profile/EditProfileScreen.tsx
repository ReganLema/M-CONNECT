// EditProfileScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import { useAuth } from "../../contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage, updateProfile } from "../../api/user";
import { Camera } from "lucide-react-native";
import PhoneInput from "../../components/PhoneInput";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user: profileUser, updateUser, refreshUser } = useUser();
  const { user: authUser, refreshAuth, updateAuthUser } = useAuth();
  
  // Use authUser as primary source if profileUser is not available
  const user = profileUser || {
    id: authUser?.id,
    name: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    avatar: authUser?.avatar,
    role: authUser?.role || "buyer",
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  // Use a ref to track if we've loaded the initial data
  const hasInitialized = useRef(false);

  // Initialize form data when component mounts or user changes
  useEffect(() => {
    if (user && !hasInitialized.current) {
      initializeForm();
      hasInitialized.current = true;
    }
  }, [user]);

  // Reset initialization when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      hasInitialized.current = false;
    }
  }, [isFocused]);

  // Initialize form data
  const initializeForm = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    
    // Extract only digits from phone
    const phoneDigits = user.phone ? user.phone.replace(/\D/g, '') : "";
    setPhone(phoneDigits);
    
    setAvatar(user.avatar || "");
    setPhoneError("");
    setHasChanges(false);
  };

  // Track changes
  useEffect(() => {
    if (hasInitialized.current) {
      const originalPhoneDigits = user.phone ? user.phone.replace(/\D/g, '') : "";
      const currentPhoneDigits = phone;
      
      const changed = (
        name !== (user.name || "") ||
        email !== (user.email || "") ||
        currentPhoneDigits !== originalPhoneDigits ||
        avatar !== (user.avatar || "")
      );
      
      setHasChanges(changed);
    }
  }, [name, email, phone, avatar, user]);

  /* =====================
     PHONE VALIDATION
  ===================== */
  const validatePhone = (phoneDigits: string): boolean => {
    // Clear previous error
    setPhoneError("");
    
    // Phone is optional, empty is OK
    if (!phoneDigits.trim()) {
      return true;
    }
    
    // Already digits from PhoneInput, but double-check
    const cleaned = phoneDigits.replace(/\D/g, '');
    
    // Basic validation - at least 10 digits for international numbers
    if (cleaned.length < 10) {
      setPhoneError("Phone number must be at least 10 digits");
      return false;
    }
    
    // Check for only digits
    if (!/^[0-9]+$/.test(cleaned)) {
      setPhoneError("Phone number can only contain digits");
      return false;
    }
    
    // Check for common invalid patterns (all same digits)
    if (/^(\d)\1{9,}$/.test(cleaned)) {
      setPhoneError("Phone number appears to be invalid");
      return false;
    }
    
    // Check maximum length
    if (cleaned.length > 15) {
      setPhoneError("Phone number is too long");
      return false;
    }
    
    return true;
  };

  /* =====================
     HANDLE PHONE CHANGE
  ===================== */
  const handlePhoneChange = (phoneDigits: string) => {
    // PhoneInput sends digits only
    setPhone(phoneDigits);
    
    // Clear error if empty
    if (!phoneDigits.trim()) {
      setPhoneError("");
      return;
    }
    
    // Validate when we have enough digits
    if (phoneDigits.length >= 10) {
      validatePhone(phoneDigits);
    } else if (phoneDigits.length > 0) {
      setPhoneError("Phone number must be at least 10 digits");
    } else {
      setPhoneError("");
    }
  };

  /* =====================
     IMAGE PICKER
  ===================== */
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

  /* =====================
     IMAGE UPLOAD HANDLER
  ===================== */
  const handleImageSelected = async (imageUri: string) => {
    if (!authUser?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setUploading(true);
    
    try {
      const avatarUrl = await uploadProfileImage(authUser.id, imageUri);
      console.log('Upload successful, avatar URL:', avatarUrl);
      
      // Update local state immediately
      setAvatar(avatarUrl);
      
      Alert.alert('Success', 'Profile picture uploaded successfully!');
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

  /* =====================
     SAVE PROFILE
  ===================== */
  const handleSave = async () => {
    if (!authUser?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }

    // Phone validation (phone is digits only at this point)
    if (!validatePhone(phone)) {
      return;
    }

    setIsSaving(true);

    try {
      // Prepare update data
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
      };

      // Only include phone if it's not empty
      if (phone.trim()) {
        // Phone is already digits only
        updateData.phone = phone.trim();
      } else {
        // Send empty string to clear phone
        updateData.phone = "";
      }

      // Only include avatar if it's changed and not empty
      if (avatar && avatar !== user.avatar) {
        updateData.avatar = avatar;
      }

      console.log('Saving profile update:', updateData);
      
      // Update on server
      const updatedUser = await updateProfile(authUser.id, updateData);
      console.log('Server response:', updatedUser);

      // Update local contexts
      if (updatedUser) {
        const cleanedPhone = phone.trim() ? phone : "";
        
        // Update UserContext
        updateUser({
          name: updatedUser.name || name,
          email: updatedUser.email || email,
          phone: updatedUser.phone || cleanedPhone,
          avatar: updatedUser.avatar || avatar,
          role: user.role,
          id: user.id,
        });

        // Update AuthContext
        updateAuthUser({
          name: updatedUser.name || name,
          email: updatedUser.email || email,
          phone: updatedUser.phone || cleanedPhone,
          avatar: updatedUser.avatar || avatar,
        });
      } else {
        // Fallback to local updates if server response is missing
        const cleanedPhone = phone.trim() ? phone : "";
        
        updateUser({
          name,
          email,
          phone: cleanedPhone,
          avatar,
          role: user.role,
          id: user.id,
        });

        updateAuthUser({
          name,
          email,
          phone: cleanedPhone,
          avatar,
        });
      }

      // Refresh both contexts from server
      await Promise.all([
        refreshAuth(),
        refreshUser(),
      ]);

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
      
    } catch (error: any) {
      console.error('Save profile error:', error);
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================
     CANCEL
  ===================== */
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive', 
            onPress: () => {
              // Reset form to original values
              initializeForm();
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-700 text-lg mt-4">Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-gray-100"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-green-700 text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Text className={`text-lg font-bold ${hasChanges ? 'text-green-700' : 'text-gray-400'}`}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-36 h-36 rounded-full overflow-hidden mb-4 border-4 border-green-500 shadow-lg bg-gray-200">
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-300">
                  <Text className="text-gray-600 text-lg">No Image</Text>
                </View>
              )}
              
              {uploading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-full">
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
            
            {/* Upload Button */}
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading || isSaving}
              className={`absolute bottom-2 right-2 w-12 h-12 rounded-full items-center justify-center ${
                uploading || isSaving ? 'bg-gray-400' : 'bg-green-500'
              } shadow-lg`}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Camera size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-600 text-sm mb-4 text-center max-w-xs">
            Tap the camera icon to upload a new profile picture. 
            The image will be uploaded to our secure servers.
          </Text>
        </View>

        {/* Input Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-100 pb-2">
            Personal Information
          </Text>
          
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              editable={!isSaving}
              className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-300"
            />
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSaving}
              className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-300"
            />
          </View>

          {/* Phone Input */}
          <View className="mb-5">
            <PhoneInput
              value={phone} // Pass digits only
              onChangeText={handlePhoneChange}
              placeholder="Enter phone number"
              editable={!isSaving}
              error={phoneError}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isSaving || uploading || !!phoneError || !hasChanges}
          activeOpacity={0.8}
          className="mb-4"
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={[0, 0]}
            end={[1, 0]}
            className={`py-4 rounded-2xl shadow-lg ${
              (isSaving || uploading || phoneError || !hasChanges) ? 'opacity-70' : ''
            }`}
          >
            {isSaving ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-center text-white text-lg font-bold ml-2">
                  Saving...
                </Text>
              </View>
            ) : (
              <Text className="text-center text-white text-lg font-bold">
                Save Changes
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity 
          onPress={handleCancel}
          disabled={isSaving || uploading}
          className="py-4 rounded-2xl bg-gray-200 shadow-sm"
        >
          <Text className="text-center text-gray-700 text-lg font-medium">
            Cancel
          </Text>
        </TouchableOpacity>

        {/* Debug Info (Development only) */}
        {__DEV__ && (
          <View className="mt-8 p-4 bg-gray-100 rounded-xl">
            <Text className="text-gray-700 font-semibold mb-2">Debug Info:</Text>
            <Text className="text-gray-600 text-xs">User ID: {authUser?.id}</Text>
            <Text className="text-gray-600 text-xs">Original Name: {user.name || "None"}</Text>
            <Text className="text-gray-600 text-xs">New Name: {name}</Text>
            <Text className="text-gray-600 text-xs">Original Phone: {user.phone || "None"}</Text>
            <Text className="text-gray-600 text-xs">Original Phone (digits): {user.phone ? user.phone.replace(/\D/g, '') : "None"}</Text>
            <Text className="text-gray-600 text-xs">New Phone (digits): {phone || "None"}</Text>
            <Text className="text-gray-600 text-xs">Phone Error: {phoneError || "None"}</Text>
            <Text className="text-gray-600 text-xs">Avatar URL: {avatar || "None"}</Text>
            <Text className="text-gray-600 text-xs">Avatar Changed: {avatar !== user.avatar ? 'Yes' : 'No'}</Text>
            <Text className="text-gray-600 text-xs">Has Changes: {hasChanges ? 'Yes' : 'No'}</Text>
            <Text className="text-gray-600 text-xs">Initialized: {hasInitialized.current ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}