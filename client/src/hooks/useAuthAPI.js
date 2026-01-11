import { useState, useCallback } from "react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(data.message || "Login successful!");
      return {
        success: true,
        error: null,
        data: data,
      };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Unable to reach the server. Please try again.";
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

  const register = useCallback(async (email, password, username) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
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

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(data.message || "Registration successful!");
      return {
        success: true,
        error: null,
        data: data,
      };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Unable to reach the server. Please try again.";
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

  return {
    isLoading,
    login,
    register,
  };
};
