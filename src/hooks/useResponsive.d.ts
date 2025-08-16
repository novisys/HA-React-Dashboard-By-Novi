// Déclaration TypeScript pour src/hooks/useResponsive.js

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface Dimensions {
  width: number;
  height: number;
}

export interface UseResponsiveReturn {
  screenSize: ScreenSize;
  dimensions: Dimensions;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

export declare function useResponsive(): UseResponsiveReturn;
