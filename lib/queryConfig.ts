export const fetchQueryConfig = (options?: any) => {
  return {
    refetchOnWindowFocus: true, // Enable window focus refetching by default
    keepPreviousData: true,
    ...options,
    staleTime: 2 * 60 * 1000, // 2 minutes - more responsive than 30 minutes

    cacheTime: 10 * 60 * 1000, // 10 minutes instead of Infinity

    retry: (failureCount: number, error: unknown) => {
      if (failureCount < 3) return true;
      return false;
    },
    retryDelay: (attempt: number) =>
      Math.min(attempt > 1 ? 2000 * 2 ** attempt : 1000, 30000),

    onError: (err: unknown) => {
      console.error("Query error:", err);
    },
  };
};
