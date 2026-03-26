
// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  Role,
  AuthResponse,
  User as ApiUser,
} from "@/api/auth";

const CDN_BASE_URL = 'https://pub-830fc031162b476396c6a260d2baec03.r2.dev';

/* =====================
   ENSURE FULL AVATAR URL
===================== */
const ensureFullAvatarUrl = (avatarUrl?: string): string | undefined => {
  if (!avatarUrl) return undefined;
  
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  if (avatarUrl.includes('/storage/')) {
    const path = avatarUrl.split('/storage/').pop();
    if (path) {
      return `${CDN_BASE_URL}/${path}`;
    }
  }
  
  return `${CDN_BASE_URL}/${avatarUrl.replace(/^\/+/, '')}`;
};

/* =====================
   TYPES
===================== */
export type User = ApiUser;

export type RegisterResult = {
  status: string;
  message: string;
  requires_verification?: boolean;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  pendingVerificationEmail: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ status: string; message: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateAuthUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  clearPendingVerification: () => Promise<void>; 
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/* =====================
   PROVIDER
===================== */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Migrate stored user to CDN
  useEffect(() => {
    const migrateStoredUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const parsedUser = JSON.parse(userJson);
          if (parsedUser?.avatar && !parsedUser.avatar.includes('r2.dev')) {
            const path = parsedUser.avatar.split('/storage/').pop();
            const cdnUrl = `https://pub-830fc031162b476396c6a260d2baec03.r2.dev/${path}`;
            console.log('🔄 MIGRATING user to CDN:', {
              from: parsedUser.avatar,
              to: cdnUrl
            });
            parsedUser.avatar = cdnUrl;
            await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    };
    
    migrateStoredUser();
  }, []);

  /* =====================
     CLEAR STORAGE
  ===================== */
  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "pendingVerificationEmail",
      ]);
      setUser(null);
      setPendingVerificationEmail(null);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  /* =====================
     CLEAR PENDING VERIFICATION 
  ===================== */
  const clearPendingVerification = async () => {
    try {
      console.log("Clearing pending verification email");
      await AsyncStorage.removeItem("pendingVerificationEmail");
      setPendingVerificationEmail(null);
    } catch (error) {
      console.error("Error clearing pending verification:", error);
    }
  };

  /* =====================
     FETCH FRESH USER DATA
  ===================== */
  const fetchFreshUserData = useCallback(async (): Promise<User | null> => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        return null;
      }

      console.log("Fetching fresh user data from server...");
      const freshUser = await getCurrentUser();
      
      if (freshUser.avatar) {
        freshUser.avatar = ensureFullAvatarUrl(freshUser.avatar);
      }
      
      console.log("Fresh user data fetched:", {
        id: freshUser.id,
        email: freshUser.email,
        email_verified: freshUser.email_verified,
        avatar: freshUser.avatar ? "present" : "missing",
      });
      
      if (freshUser) {
        await AsyncStorage.setItem("user", JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (error: any) {
      console.warn("Failed to fetch fresh user data:", error.message);
    }
    return null;
  }, []);

  /* =====================
     LOAD USER FROM STORAGE - ADD PENDING EMAIL CHECK
  ===================== */
  const loadUserFromStorage = useCallback(async () => {
    try {
      const [userJson, accessToken, pendingEmail] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("accessToken"),
        AsyncStorage.getItem("pendingVerificationEmail"),
      ]);

      //Check for pending verification email
      if (pendingEmail) {
        console.log("Found pending verification email:", pendingEmail);
        setPendingVerificationEmail(pendingEmail);
      }

      if (userJson && accessToken) {
        console.log("Found stored user data, attempting to refresh...");
        
        try {
          const freshUser = await fetchFreshUserData();
          if (freshUser) {
            setUser(freshUser);
            console.log("Using fresh user data from server");
            
            //If user is verified, clear pending verification email
            if (freshUser.email_verified && pendingEmail) {
              console.log("✅ User is verified, clearing pending verification email");
              await AsyncStorage.removeItem("pendingVerificationEmail");
              setPendingVerificationEmail(null);
            }
          } else {
            throw new Error("Could not fetch fresh data");
          }
        } catch (freshError) {
          console.log("Using stored user data (fallback)");
          const parsedUser: User = JSON.parse(userJson);
          
          if (parsedUser?.id && parsedUser?.email && parsedUser?.role) {
            if (parsedUser.avatar && !parsedUser.avatar.includes('r2.dev')) {
              parsedUser.avatar = ensureFullAvatarUrl(parsedUser.avatar);
              console.log('🔄 Converted stored avatar to CDN:', parsedUser.avatar);
            }
            setUser(parsedUser);
          } else {
            console.log("Invalid stored user data");
            await clearStorage();
          }
        }
      } else {
        console.log("No stored user data found");
        setUser(null);
      }
    } catch (err) {
      console.error("Error loading user from storage:", err);
      await clearStorage();
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [fetchFreshUserData]);

  /* =====================
     INITIAL LOAD
  ===================== */
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  /* =====================
     REGISTER - WITH PENDING VERIFICATION
  ===================== */
  const register = async (
  name: string,
  email: string,
  password: string,
  role: Role
) => {
  try {
    // setLoading(true)
    console.log("AuthContext: Attempting registration for", email);

    const response: AuthResponse = await apiRegister({
      name,
      email,
      password,
      role,
    });

    console.log("AuthContext register response:", {
      status: response.status,
      requires_verification: response.requires_verification,
      email: response.user?.email,
    });

    if (response.requires_verification) {
      console.log("Email verification required");
      
      await AsyncStorage.setItem("pendingVerificationEmail", email);
      setPendingVerificationEmail(email);
      
      return {
        status: "success",
        message: response.message || "Registration successful. Please verify your email.",
        requires_verification: true,
        email: email,
      };
    }

    console.log("No verification required - auto-logging in");
    
    await AsyncStorage.multiSet([
      ["accessToken", response.accessToken],
      ["refreshToken", response.refreshToken],
    ]);

    let userToStore = response.user;
    if (userToStore.avatar && !userToStore.avatar.includes('r2.dev')) {
      userToStore.avatar = ensureFullAvatarUrl(userToStore.avatar);
    }
    
    await AsyncStorage.setItem("user", JSON.stringify(userToStore));
    setUser(userToStore);
    
    return {
      status: "success",
      message: response.message || "Registration successful",
      requires_verification: false,
    };
  } catch (err: any) {
    console.error("AuthContext register error:", err.message);
    throw new Error(err.message || "Registration failed");
  }
  
};
  /* =====================
     LOGIN - FIXED WITH PROPER ERROR HANDLING
  ===================== */
const login = async (email: string, password: string) => {
  try {
    setLoading(true);
    console.log("AuthContext: Attempting login for", email);

    const response: AuthResponse = await apiLogin({ email, password });

    console.log("AuthContext login success:", {
      user: response.user.email,
      avatar: response.user.avatar,
      hasToken: !!response.accessToken,
    });

    // Store tokens
    await AsyncStorage.multiSet([
      ["accessToken", response.accessToken],
      ["refreshToken", response.refreshToken],
    ]);

    if (response.user.avatar && !response.user.avatar.includes('r2.dev')) {
      response.user.avatar = ensureFullAvatarUrl(response.user.avatar);
    }

    let userToStore = response.user;
    try {
      const freshUser = await fetchFreshUserData();
      if (freshUser) {
        userToStore = freshUser;
        console.log("Using fresh user data with avatar");
      }
    } catch (freshError) {
      console.warn("Could not fetch fresh data, using response data");
    }
    
    await AsyncStorage.setItem("user", JSON.stringify(userToStore));
    setUser(userToStore);
    
    // ✅ Clear pending verification ONLY on successful login
    await clearPendingVerification();
    
    console.log("User stored after login:", {
      ...userToStore,
      avatar: userToStore.avatar ? '✅ CDN' : '❌ none'
    });
    
    return {
      status: "success",
      message: response.message || "Login successful",
    };
  } catch (err: any) {
    console.error("AuthContext login error:", err);
    
    // ✅ Check if this is a verification required error
    const isVerificationRequired = err.response?.data?.requires_verification === true;
    
    if (isVerificationRequired) {
      // ✅ Keep pending verification email for redirect to OTP
      console.log("Email verification required - keeping pending email");
      throw new Error("Please verify your email before logging in");
    } else {
      // ✅ CRITICAL: DO NOT clear pending verification on wrong password
      // This prevents any navigation changes on login failure
      console.log("Login failed - showing error only, staying on login screen");
      
      // Extract meaningful error message
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // ✅ Just throw error, don't modify any state
      throw new Error(errorMessage);
    }
  } finally {
    setLoading(false);
  }
};

  /* =====================
     LOGOUT - CLEAR PENDING VERIFICATION
  ===================== */
  const logout = async () => {
    try {
      setLoading(true);
      try {
        await apiLogout();
      } catch (err) {
        console.warn("Logout API error (non-critical):", err);
      }
      await clearStorage();
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     REFRESH AUTH STATE - IMPROVED
  ===================== */
  const refreshAuth = async () => {
    try {
      console.log("Refreshing auth state...");
      const freshUser = await fetchFreshUserData();
      
      if (freshUser) {
        setUser(freshUser);
        console.log("Auth refreshed with fresh data");
        
        //  Check if we have a pending verification email and the user is now verified
        const pendingEmail = await AsyncStorage.getItem("pendingVerificationEmail");
        
        if (pendingEmail && freshUser.email_verified === true) {
          console.log("✅ User is verified, clearing pending verification email");
          await clearPendingVerification();
        }
      } else {
        console.log("No fresh data available");
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
    }
  };

  /* =====================
     UPDATE AUTH USER
  ===================== */
  const updateAuthUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      
      let processedUpdates = { ...updates };
      if (updates.avatar) {
        processedUpdates.avatar = ensureFullAvatarUrl(updates.avatar);
        console.log('🔄 Converting avatar to CDN URL:', processedUpdates.avatar);
      }
      
      const updated = { ...prev, ...processedUpdates };
      console.log("Updating auth user locally:", {
        ...processedUpdates,
        avatar: processedUpdates.avatar ? '✅ set' : 'no change'
      });
      
      AsyncStorage.setItem("user", JSON.stringify(updated))
        .catch(err => console.error("Error saving user to storage:", err));
      
      return updated;
    });
  };

  /* =====================
     IS AUTHENTICATED
  ===================== */
  const isAuthenticated = !!user?.id && !!user?.email && user?.email_verified === true;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: loading || initialLoad,
      pendingVerificationEmail,
      login, 
      register, 
      logout,
      refreshAuth,
      updateAuthUser,
      isAuthenticated,
      clearPendingVerification, 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/* =====================
   HOOK
===================== */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};