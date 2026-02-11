// hooks/useAuthWrapper.ts
import { useMockAuth } from "@/contexts/MockAuthContext";
// import { useAuth } from "@/contexts/AuthContext"; // Keep commented for now

// Set this to true to use mock, false to use real
const USE_MOCK_AUTH = true;

export const useAuthWrapper = () => {
  if (USE_MOCK_AUTH) {
    return useMockAuth();
  }
  // return useAuth(); // Uncomment when you have real backend
  return useMockAuth(); // Fallback
};