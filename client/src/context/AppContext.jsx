import React, { createContext, useState, useCallback, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isDark, setIsDark] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Verify authentication on app load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/is-auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        // 401 is expected when user is not logged in - not an error
        // Silently handle it without throwing
        if (response.status === 401) {
          setIsAuthChecking(false);
          return;
        }

        if (!response.ok) {
          // Only throw for non-401 errors
          throw new Error(`Auth check failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUserData(data.user);
          // Sync with localStorage for Chat component
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error) {
        // Only log unexpected errors, not 401 (unauthorized)
        if (!error.message.includes('401')) {
          console.error("Auth verification error:", error);
        }
      } finally {
        setIsAuthChecking(false);
      }
    };

    verifyAuth();
  }, [backendUrl]);

  const logout = useCallback(() => {
    setUserData(null);
  }, []);

  const value = {
    backendUrl,
    isDark,
    setIsDark,
    isLoggingIn,
    setIsLoggingIn,
    userData,
    setUserData,
    isAuthChecking,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};