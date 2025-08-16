// Déclaration TypeScript pour ./hooks/useResponsive.js

declare module './hooks/useResponsive' {
  export interface BreakpointValues {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  }

  export type Breakpoint = keyof BreakpointValues;

  export interface UseResponsiveReturn {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeScreen: boolean;
    currentBreakpoint: Breakpoint;
    screenWidth: number;
    screenHeight: number;
    isPortrait: boolean;
    isLandscape: boolean;
  }

  export const useResponsive: () => UseResponsiveReturn;

  export const breakpoints: BreakpointValues;
}

export {};
