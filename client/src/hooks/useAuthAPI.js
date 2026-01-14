import { useState, useCallback } from "react";
import { toast } from "react-toastify";

// Prefer VITE_API_URL (for deployed backend), then VITE_BACKEND_URL, then localhost
const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";

export const useAuthAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || "Login failed";
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          data: null,
        };
      }

      toast.success(data.message || "Login successful!");
      return {
        success: true,
        error: null,
        data: data,
      };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.message || "Unable to reach the server. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: null,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, confirmPassword, username) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          username,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || "Registration failed";
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          data: null,
        };
      }

      toast.success(data.message || "Registration successful!");
      return {
        success: true,
        error: null,
        data: data,
      };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.message || "Unable to reach the server. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: null,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || "Logout failed";
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      toast.success(data.message || "Logged out successfully!");
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage =
        error.message || "Unable to reach the server. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    login,
    register,
    logout,
  };
};
