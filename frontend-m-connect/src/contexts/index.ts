// contexts/index.ts
// Export a unified auth hook that switches between mock and real

// Set this to true to use mock, false to use real
const USE_MOCK_AUTH = true;

// Import both
import { useAuth as useRealAuth } from "./AuthContext";
import { useMockAuth } from "./MockAuthContext";
import { AuthProvider as RealAuthProvider } from "./AuthContext";
import { MockAuthProvider } from "./MockAuthContext";

// Export the appropriate hook
export const useAuth = USE_MOCK_AUTH ? useMockAuth : useRealAuth;

// Export the appropriate provider
export const AuthProvider = USE_MOCK_AUTH ? MockAuthProvider : RealAuthProvider;

// Re-export UserProvider
export { UserProvider } from "./UserContext";

// Re-export SettingsProvider
export { SettingsProvider } from "./SettingsContext";