import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isDark, setIsDark] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const value = {
    backendUrl,
    isDark,
    setIsDark,
    isLoggingIn,
    setIsLoggingIn,
    userData,
    setUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};