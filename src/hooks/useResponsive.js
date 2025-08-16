import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../config/constants';

export function useResponsive() {
  const [screenSize, setScreenSize] = useState('desktop');
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });

      if (width < BREAKPOINTS.MOBILE) {
        setScreenSize('mobile');
      } else if (width < BREAKPOINTS.TABLET) {
        setScreenSize('tablet');
      } else if (width < BREAKPOINTS.DESKTOP) {
        setScreenSize('desktop');
      } else {
        setScreenSize('wide');
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    dimensions,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isWide: screenSize === 'wide',
  };
}
