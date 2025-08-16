// useTheme.js basique pour éviter l'erreur d'import
import React, { createContext, useContext, useState } from 'react';

// Contexte du thème
const ThemeContext = createContext();

// Hook useTheme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: {
        colors: {
          primary: '#1FB8CD',
          secondary: '#FFC185',
          background: '#F5F5F7',
          surface: '#FFFFFF',
          text: '#1D1D1F'
        }
      },
      setTheme: () => {},
      isDarkMode: false,
      toggleDarkMode: () => {}
    };
  }
  return context;
};

// Composant ThemeProvider
export const ThemeProvider = ({ children, theme: initialTheme }) => {
  const [theme, setTheme] = useState(initialTheme || {
    colors: {
      primary: '#1FB8CD',
      secondary: '#FFC185', 
      background: '#F5F5F7',
      surface: '#FFFFFF',
      text: '#1D1D1F'
    }
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
};