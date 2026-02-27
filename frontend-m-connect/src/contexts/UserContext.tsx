// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "./AuthContext";
import { getUserProfile } from "@/api/user";




const CDN_BASE_URL = 'https://pub-830fc031162b476396c6a260d2baec03.r2.dev';

const ensureFullAvatarUrl = (avatarUrl?: string): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  if (avatarUrl.includes('/storage/')) {
    const path = avatarUrl.split('/storage/').pop();
    return path ? `${CDN_BASE_URL}/${path}` : avatarUrl;
  }
  return `${CDN_BASE_URL}/${avatarUrl.replace(/^\/+/, '')}`;
};



/* =========================
   USER TYPES
========================= */
export type UserRole = "buyer" | "farmer";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
};

/* =========================
   CONTEXT TYPE
========================= */
type UserContextType = {
  user: User | null;
  loading: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
  updateRole: (role: UserRole) => void;
  updateAvatar: (avatarUrl: string) => void;
  refreshUser: () => Promise<void>;
  clearUserCache: () => Promise<void>;
};

/* =========================
   CREATE CONTEXT
========================= */
const UserContext = createContext<UserContextType | undefined>(undefined);

/* =========================
   PROVIDER
========================= */
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, updateAuthUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  /* =========================
     FETCH USER PROFILE
  ========================= */
  const fetchUserProfile = useCallback(async (userId: number): Promise<User | null> => {
  try {
    console.log(`Fetching user profile for ID: ${userId}`);
    const profile = await getUserProfile(userId);
    
    // Ensure avatar is full CDN URL
    const avatar = ensureFullAvatarUrl(profile.avatar || authUser?.avatar);
    
    const userData: User = {
      id: profile.id || userId,
      name: profile.name || authUser?.name || "",
      email: profile.email || authUser?.email || "",
      role: (profile.role as UserRole) || (authUser?.role as UserRole) || "buyer",
      avatar: avatar,
      phone: profile.phone || authUser?.phone,
      location: profile.location || authUser?.location,
    };
    
    console.log("Fetched user profile:", {
      ...userData,
      avatar: userData.avatar ? '✅' : '❌'
    });
    
    return userData;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}, [authUser]);

  /* =========================
     LOAD USER DATA
  ========================= */
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      console.log("User not authenticated, clearing user context");
      setUser(null);
      setCurrentUserId(null);
      setLoading(false);
      return;
    }

    // Check if user changed
    if (currentUserId !== authUser.id) {
      console.log(`User changed from ${currentUserId} to ${authUser.id}`);
      
      if (currentUserId) {
        await AsyncStorage.removeItem(`user_data_${currentUserId}`);
      }
      
      setCurrentUserId(authUser.id);
    }

    setLoading(true);
    
    try {
      let userData: User | null = null;
      
      // Try to get fresh data from server first
      userData = await fetchUserProfile(authUser.id);
      
      if (!userData) {
        // Fallback to auth data
        userData = {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role as UserRole,
          avatar: authUser.avatar,
          phone: authUser.phone,
          location: authUser.location,
        };
        console.log("Using auth user data as fallback");
      }
      
      // Update state
      setUser(userData);
      
      // Cache it
      await AsyncStorage.setItem(`user_data_${authUser.id}`, JSON.stringify(userData));
      
    } catch (error) {
      console.error("Failed to load user data:", error);
      
      // Ultimate fallback
      if (authUser) {
        const basicUser: User = {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role as UserRole,
          avatar: authUser.avatar,
          phone: authUser.phone,
          location: authUser.location,
        };
        setUser(basicUser);
      }
    } finally {
      setLoading(false);
    }
  }, [authUser, currentUserId, fetchUserProfile, isAuthenticated]);

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  /* =========================
     REFRESH USER
  ========================= */
  const refreshUser = useCallback(async () => {
    if (!authUser?.id) return;
    
    console.log("Refreshing user data...");
    setLoading(true);
    
    try {
      const freshData = await fetchUserProfile(authUser.id);
      
      if (freshData) {
        setUser(freshData);
        await AsyncStorage.setItem(`user_data_${authUser.id}`, JSON.stringify(freshData));
        console.log("User data refreshed successfully");
        
        // Also sync with auth context
        updateAuthUser({
          avatar: freshData.avatar,
          name: freshData.name,
          phone: freshData.phone,
          location: freshData.location,
        });
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, fetchUserProfile, updateAuthUser]);

  /* =========================
     CLEAR CACHE
  ========================= */
  const clearUserCache = useCallback(async () => {
    if (authUser?.id) {
      await AsyncStorage.removeItem(`user_data_${authUser.id}`);
    }
    setUser(null);
    setCurrentUserId(null);
  }, [authUser?.id]);

  /* =========================
     UPDATE FUNCTIONS
  ========================= */
  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) {
        const newUser: User = {
          id: authUser?.id || 0,
          name: authUser?.name || "",
          email: authUser?.email || "",
          role: (authUser?.role as UserRole) || "buyer",
          ...updatedData,
        };
        
        if (authUser?.id) {
          AsyncStorage.setItem(`user_data_${authUser.id}`, JSON.stringify(newUser));
        }
        return newUser;
      }
      
      const updated = { ...prev, ...updatedData };
      if (authUser?.id) {
        AsyncStorage.setItem(`user_data_${authUser.id}`, JSON.stringify(updated));
      }
      
      // Also sync with auth context
      if (updatedData.avatar || updatedData.name || updatedData.phone || updatedData.location) {
        updateAuthUser({
          avatar: updatedData.avatar,
          name: updatedData.name,
          phone: updatedData.phone,
          location: updatedData.location,
        });
      }
      
      return updated;
    });
  }, [authUser, updateAuthUser]);

  const updateRole = useCallback((role: UserRole) => {
    updateUser({ role });
  }, [updateUser]);

  const updateAvatar = useCallback((avatarUrl: string) => {
    console.log("Updating avatar in UserContext:", avatarUrl);
    updateUser({ avatar: avatarUrl });
  }, [updateUser]);

  /* =========================
     CONTEXT VALUE
  ========================= */
  const contextValue: UserContextType = {
    user,
    loading,
    updateUser,
    updateRole,
    updateAvatar,
    refreshUser,
    clearUserCache,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

/* =========================
   CUSTOM HOOK
========================= */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};