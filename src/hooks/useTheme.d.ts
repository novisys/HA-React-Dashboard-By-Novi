// Fichier de déclaration à placer dans src/hooks/useTheme.d.ts

import { ReactNode } from 'react';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    [key: string]: string;
  };
  [key: string]: any;
}

export interface ThemeProviderProps {
  theme?: Theme;
  children: ReactNode;
}

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

declare const ThemeProvider: React.ComponentType<ThemeProviderProps>;
declare const useTheme: () => UseThemeReturn;

export { ThemeProvider, useTheme };
