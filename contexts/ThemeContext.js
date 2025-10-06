// contexts/ThemeContext.js
import React, { createContext, useState, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = {
    light: {
      background: "#F5F5FF",
      text: "#1E1E1E",
      card: "#FFFFFF",
      primary: "#6C47FF",
      secondary: "#A68EFF",
    },
    dark: {
      background: "#0B0B0D",
      text: "#E5E5E5",
      card: "#1A1A1C",
      primary: "#9F7BFF",
      secondary: "#6C47FF",
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: colors[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => useContext(ThemeContext);
