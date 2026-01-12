// Enhanced API configuration with intelligent caching and retry logic
export const fetchQueryConfig = (options?: any) => {
  return {
    // Smart refetching strategy
    refetchOnWindowFocus: false, // Disable aggressive refetching to reduce API calls
    refetchOnReconnect: true, // Refetch when reconnecting to network
    refetchOnMount: true, // Refetch when component mounts if data is stale

    // Keep previous data during refetches for smoother UX
    placeholderData: (previousData: any) => previousData,

    // Extended cache retention for better performance
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache even if unused

    // Intelligent retry logic with exponential backoff
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },

    // Exponential backoff: 1s, 2s, 4s, 8s (max)
    retryDelay: (attemptIndex: number) => {
      return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
    },

    // Network mode for offline support
    networkMode: 'offlineFirst' as const,

    // Custom options can override defaults
    ...options,
  };
};

// Configuration for mutations with optimistic updates
export const mutationConfig = (options?: any) => {
  return {
    // Retry failed mutations
    retry: 2,
    retryDelay: 1000,

    // Network mode for offline support
    networkMode: 'offlineFirst' as const,

    // Custom options
    ...options,
  };
};

// Configuration for infinite queries (pagination)
export const infiniteQueryConfig = (options?: any) => {
  return {
    ...fetchQueryConfig(),

    // Keep previous pages in view
    getPreviousPageParam: (firstPage: any) => firstPage.previousCursor ?? undefined,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,

    // Increased stale time for paginated data
    staleTime: 10 * 60 * 1000, // 10 minutes

    ...options,
  };
};

// Configuration for real-time/frequently updating data
export const realtimeQueryConfig = (options?: any) => {
  return {
    ...fetchQueryConfig(),

    // More aggressive refetching for real-time data
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: false, // Don't refetch when tab is not visible

    ...options,
  };
};
