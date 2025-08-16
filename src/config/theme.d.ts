// Déclaration TypeScript pour ./config/theme.js

declare module './config/theme' {
  export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    [key: string]: string | undefined;
  }

  export interface ModernTheme {
    colors: ThemeColors;
    spacing?: {
      [key: string]: string | number;
    };
    typography?: {
      [key: string]: any;
    };
    breakpoints?: {
      [key: string]: string;
    };
    [key: string]: any;
  }

  export const modernTheme: ModernTheme;

  export const darkTheme: ModernTheme;

  export const lightTheme: ModernTheme;
}

export {};
