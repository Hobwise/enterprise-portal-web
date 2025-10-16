'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * Breakpoint: 768px (matches Tailwind's md: breakpoint)
 * @returns {boolean} true if mobile, false if desktop
 */
export const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    // Create media query for mobile detection
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Handler for media query changes
    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener('change', handler);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return isMobile;
};

export default useMobile;
