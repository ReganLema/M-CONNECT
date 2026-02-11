// src/api/user.ts
import API from "./api";

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  location?: string;
};

//  ADDED: Get user profile by ID
export const getUserProfile = async (userId: number): Promise<any> => {
  try {
    console.log(`Fetching user profile for ID: ${userId}`);
    const response = await API.get(`/users/${userId}`);
    
    console.log("User profile response:", response.data);
    
    if (response.data?.status === 'success' && response.data?.user) {
      return response.data.user;
    }
    
    throw new Error("Failed to fetch user profile");
  } catch (error: any) {
    console.error("Get user profile error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || "Failed to fetch user data");
  }
};

export const uploadProfileImage = async (
  userId: number,
  imageUri: string
): Promise<string> => {
  try {
    console.log("Uploading image for user:", userId);
    
    // Create FormData
    const formData = new FormData();
    
    // Get filename from URI
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    // Get file type
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append image file
    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    console.log("Sending upload request...");
    const response = await API.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for large images
    });
    
    console.log("Upload response:", response.data);
    
    if (response.data?.status === 'success') {
      // Try different possible response formats
      const avatarUrl = 
        response.data.avatar_url || 
        response.data.user?.avatar ||
        response.data.avatar;
      
      if (avatarUrl) {
        console.log("Upload successful, avatar URL:", avatarUrl);
        return avatarUrl;
      }
    }
    
    console.error("Invalid response format:", response.data);
    throw new Error(response.data?.message || "Invalid server response");
    
  } catch (error: any) {
    console.error("Upload image error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // Provide user-friendly error messages
    if (error.response?.status === 413) {
      throw new Error("Image is too large. Please select a smaller image.");
    }
    
    if (error.response?.status === 415) {
      throw new Error("Invalid image format. Please use JPG or PNG.");
    }
    
    if (error.response?.data?.errors?.avatar) {
      const errorMsg = Array.isArray(error.response.data.errors.avatar) 
        ? error.response.data.errors.avatar[0]
        : error.response.data.errors.avatar;
      throw new Error(errorMsg);
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error("Upload timeout. Please check your connection and try again.");
    }
    
    throw new Error(error.message || "Failed to upload image. Please try again.");
  }
};

export const updateProfile = async (
  userId: number,
  data: UpdateProfilePayload
): Promise<any> => {
  try {
    console.log("Updating profile for user:", userId, data);
    const response = await API.put(`/users/${userId}`, data);
    
    if (response.data?.status === 'success' && response.data?.user) {
      return response.data.user;
    }
    
    throw new Error("Failed to update profile");
  } catch (error: any) {
    console.error("Update profile error:", error);
    throw new Error(error.response?.data?.message || "Update failed");
  }
};

// functions for farmer profile management

export type FarmerProfile = {
  farm_name: string;
  location: string;
  phone: string;
  is_verified: boolean;
  verification_status: "pending" | "under_review" | "verified";
  farm_description?: string;
  farm_size?: string;
  specialty?: string;
  avatar?: string; // ✅ ADDED: Include avatar in farmer profile
};

export const getFarmerProfile = async (userId: number): Promise<FarmerProfile> => {
  try {
    console.log("Fetching farmer profile for user:", userId);
    const response = await API.get(`/farmers/${userId}/profile`);
    
    console.log("Farmer profile response:", response.data);
    
    if (response.data?.status === 'success' && response.data?.farmer) {
      return response.data.farmer;
    }
    
    throw new Error("Failed to fetch farmer profile");
  } catch (error: any) {
    console.error("Get farmer profile error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch farmer data");
  }
};

export const updateFarmerProfile = async (
  userId: number,
  data: Partial<FarmerProfile>
): Promise<FarmerProfile> => {
  try {
    console.log("Updating farmer profile for user:", userId, data);
    const response = await API.put(`/farmers/${userId}/profile`, data);
    
    if (response.data?.status === 'success' && response.data?.farmer) {
      return response.data.farmer;
    }
    
    throw new Error("Failed to update farmer profile");
  } catch (error: any) {
    console.error("Update farmer profile error:", error);
    throw new Error(error.response?.data?.message || "Update failed");
  }
};

//  ADDED: Utility function to ensure avatar URLs are full URLs
export const ensureFullAvatarUrl = (avatarUrl?: string, baseUrl: string = 'http://192.168.0.200:8000'): string | undefined => {
  if (!avatarUrl) return undefined;
  
  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // If it starts with storage/, prepend the base URL
  if (avatarUrl.startsWith('storage/')) {
    return `${baseUrl}/storage/${avatarUrl.replace('storage/', '')}`;
  }
  
  // If it's just a filename, assume it's in storage/avatars
  return `${baseUrl}/storage/${avatarUrl}`;
};

//  ADDED: Add cache busting to avatar URL
export const addCacheBusting = (avatarUrl: string, source?: string): string => {
  const timestamp = Date.now();
  const separator = avatarUrl.includes('?') ? '&' : '?';
  
  if (source) {
    return `${avatarUrl}${separator}t=${timestamp}&src=${source}`;
  }
  
  return `${avatarUrl}${separator}t=${timestamp}`;
};