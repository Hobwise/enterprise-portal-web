import { useEffect } from 'react';
import {
  initializeUserActivityTracking,
  startUserActivityTracking,
} from '@/lib/activityTracking';

export const useActivityTracking = () => {
  useEffect(() => {
    // Initialize tracking listeners
    initializeUserActivityTracking();

    // Start periodic activity checking
    startUserActivityTracking();
  }, []);
};
