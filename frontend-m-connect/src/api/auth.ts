// src/api/auth.ts
import API from "./api";

/* =======================
   TYPES
======================= */
export type Role = "buyer" | "farmer";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
  password_confirmation?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

//  Update User type to match Laravel response
export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string; // Make avatar optional string
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthResponse = {
  status: string;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  token_type: string;
  expires_in: number;
};

/* =======================
   RESPONSE VALIDATOR & PARSER - FIXED
======================= */
const parseAndValidateResponse = (
  response: any,
  context: string
): AuthResponse => {
  console.log(`${context} raw response:`, response);

  // If response is a string (might have BOM), parse it
  let data = response;
  if (typeof response === 'string') {
    try {
      data = JSON.parse(response.replace(/^\uFEFF/, ''));
    } catch (parseError) {
      console.error(`${context} JSON parse error:`, parseError, "String:", response.substring(0, 100));
      throw new Error(`Invalid JSON response from server`);
    }
  }

  // Validate response structure
  if (!data || typeof data !== 'object') {
    console.error(`${context} invalid response type:`, data);
    throw new Error(`Invalid response from server`);
  }

  // Check for errors first
  if (data.status === 'error') {
    throw new Error(data.message || `${context} failed`);
  }

  // Validate required fields
  const requiredFields = ['user', 'accessToken'];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`${context} missing field:`, field, data);
      throw new Error(`Server response missing: ${field}`);
    }
  }

  // Validate user object
  const user = data.user;
  const requiredUserFields = ['id', 'name', 'email', 'role'];
  for (const field of requiredUserFields) {
    if (!user[field]) {
      console.error(`${context} missing user field:`, field, user);
      throw new Error(`Server response missing user.${field}`);
    }
  }

  // Ensure id is a number
  if (typeof user.id !== 'number') {
    user.id = Number(user.id);
    if (isNaN(user.id)) {
      throw new Error(`Invalid user ID: ${user.id}`);
    }
  }

  //  FIXED: Include avatar from response if available
  return {
    status: data.status || 'success',
    message: data.message || `${context.charAt(0).toUpperCase() + context.slice(1)} successful`,
    user: {
      id: Number(user.id),
      name: String(user.name),
      email: String(user.email),
      role: user.role as Role,
      avatar: user.avatar || undefined, // ✅ Include avatar
      phone: user.phone || undefined,
      location: user.location || undefined,
    },
    accessToken: String(data.accessToken || data.token || ''),
    refreshToken: String(data.refreshToken || ''),
    token_type: String(data.token_type || 'bearer'),
    expires_in: Number(data.expires_in || 3600),
  };
};

/* =======================
   REGISTER - FIXED
======================= */
export const register = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  try {
    const requestPayload = {
      ...payload,
      password_confirmation: payload.password_confirmation || payload.password,
    };

    console.log("Register sending:", { ...requestPayload, password: '***' });

    const response = await API.post("/auth/register", requestPayload);
    
    console.log("Register response received:", response.data);
    
    return parseAndValidateResponse(response.data, "register");
  } catch (error: any) {
    console.error("=== REGISTER API ERROR DETAILS ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Response status:", error.response?.status);
    console.error("Response headers:", error.response?.headers);
    console.error("Response data:", error.response?.data);
    console.error("=== END ERROR DETAILS ===");

    let errorMessage = "Registration failed. Please try again.";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        const firstError = Object.values(errorData.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/* =======================
   LOGIN - FIXED
======================= */
export const login = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  try {
    console.log("Login sending:", { ...payload, password: '***' });

    const response = await API.post("/auth/login", payload);
    
    console.log("Login response received:", response.data);
    
    return parseAndValidateResponse(response.data, "login");
  } catch (error: any) {
    console.error("=== LOGIN API ERROR DETAILS ===");
    console.error("Error message:", error.message);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    console.error("=== END ERROR DETAILS ===");

    let errorMessage = "Login failed. Please check your credentials.";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        const firstError = Object.values(errorData.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/* =======================
   LOGOUT
======================= */
export const logout = async (): Promise<void> => {
  try {
    await API.post("/auth/logout");
  } catch (error) {
    console.warn("Logout API error (non-critical):", error);
  }
};

/* =======================
   GET CURRENT USER - FIXED
======================= */
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log("Fetching current user from /auth/me...");
    const response = await API.get("/auth/me");
    
    console.log("Current user response:", response.data);
    
    if (response.data?.status === 'success' && response.data?.user) {
      const userData = response.data.user;
      
      //  FIXED: Ensure avatar is included
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as Role,
        avatar: userData.avatar || undefined, // ✅ Include avatar
        phone: userData.phone || undefined,
        location: userData.location || undefined,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
      
      console.log("Parsed user data:", user);
      return user;
    }
    
    throw new Error("Invalid response format from server");
  } catch (error: any) {
    console.error("Get current user error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || "Failed to get current user");
  }
};

/* =======================
   REFRESH TOKEN
======================= */
export const refreshToken = async (): Promise<{ accessToken: string; refreshToken?: string }> => {
  try {
    const response = await API.post("/auth/refresh");
    return response.data;
  } catch (error: any) {
    console.error("Refresh token error:", error);
    throw new Error(error.response?.data?.message || "Failed to refresh token");
  }
};




/* =======================
   CHANGE PASSWORD - FIXED
======================= */
export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
  newPassword_confirmation?: string; // Add this for confirmation
}) => {
  try {
    // Format data for Laravel validation
    const requestData = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      newPassword_confirmation: data.newPassword_confirmation || data.newPassword, // Add confirmation field
    };

    console.log("Changing password...", { 
      oldPassword: '***', 
      newPassword: '***',
      newPassword_confirmation: '***'
    });

    const response = await API.post("/auth/change-password", requestData);
    
    console.log("Change password response:", response.data);

    if (response.data?.status === 'success') {
      return {
        success: true,
        message: response.data.message || "Password updated successfully"
      };
    } else {
      throw new Error(response.data?.message || "Failed to change password");
    }
  } catch (error: any) {
    console.error("Change password API error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let errorMessage = "Failed to change password. Please try again.";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        // Extract all validation errors
        const errors = errorData.errors;
        const errorMessages: string[] = [];
        
        Object.keys(errors).forEach(key => {
          if (Array.isArray(errors[key])) {
            errors[key].forEach((msg: string) => {
              errorMessages.push(`${key}: ${msg}`);
            });
          }
        });
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n');
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};


