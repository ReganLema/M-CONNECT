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

/* =====================
   TYPES
===================== */
export type User = ApiUser;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ status: string; message: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => Promise<{ status: string; message: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateAuthUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
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

  /* =====================
     CLEAR STORAGE
  ===================== */
  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
      ]);
      setUser(null);
    } catch (error) {
      console.error("Error clearing storage:", error);
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
      console.log("Fresh user data fetched:", {
        id: freshUser.id,
        email: freshUser.email,
        avatar: freshUser.avatar ? "present" : "missing"
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
     LOAD USER FROM STORAGE
  ===================== */
  const loadUserFromStorage = useCallback(async () => {
    try {
      const [userJson, accessToken] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("accessToken"),
      ]);

      if (userJson && accessToken) {
        console.log("Found stored user data, attempting to refresh...");
        
        try {
          const freshUser = await fetchFreshUserData();
          if (freshUser) {
            setUser(freshUser);
            console.log("Using fresh user data from server");
          } else {
            throw new Error("Could not fetch fresh data");
          }
        } catch (freshError) {
          console.log("Using stored user data (fallback)");
          const parsedUser: User = JSON.parse(userJson);
          if (parsedUser?.id && parsedUser?.email && parsedUser?.role) {
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
     LOGIN
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

      // Get fresh user data with avatar
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
      
      // Store user data
      await AsyncStorage.setItem("user", JSON.stringify(userToStore));
      setUser(userToStore);
      
      console.log("User stored after login:", userToStore);
      
      return {
        status: "success",
        message: response.message || "Login successful",
      };
    } catch (err: any) {
      console.error("AuthContext login error:", err.message);
      throw new Error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     REGISTER
  ===================== */
  const register = async (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => {
    try {
      setLoading(true);
      console.log("AuthContext: Attempting registration for", email);

      const response: AuthResponse = await apiRegister({
        name,
        email,
        password,
        role,
      });

      console.log("AuthContext register success:", {
        user: response.user.email,
        role: response.user.role,
      });

      // Store tokens
      await AsyncStorage.multiSet([
        ["accessToken", response.accessToken],
        ["refreshToken", response.refreshToken],
      ]);

      let userToStore = response.user;
      try {
        const freshUser = await fetchFreshUserData();
        if (freshUser) {
          userToStore = freshUser;
          console.log("Using fresh user data from server");
        }
      } catch (freshError) {
        console.warn("Could not fetch fresh data, using response data");
      }
      
      await AsyncStorage.setItem("user", JSON.stringify(userToStore));
      setUser(userToStore);
      
      return {
        status: "success",
        message: response.message || "Registration successful",
      };
    } catch (err: any) {
      console.error("AuthContext register error:", err.message);
      throw new Error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     LOGOUT
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
     REFRESH AUTH STATE
  ===================== */
  const refreshAuth = async () => {
    try {
      console.log("Refreshing auth state...");
      const freshUser = await fetchFreshUserData();
      if (freshUser) {
        setUser(freshUser);
        console.log("Auth refreshed with fresh data");
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
      
      const updated = { ...prev, ...updates };
      console.log("Updating auth user locally:", updates);
      
      AsyncStorage.setItem("user", JSON.stringify(updated));
      
      return updated;
    });
  };

  /* =====================
     IS AUTHENTICATED
  ===================== */
  const isAuthenticated = !!user?.id && !!user?.email;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: loading || initialLoad, 
      login, 
      register, 
      logout,
      refreshAuth,
      updateAuthUser,
      isAuthenticated
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