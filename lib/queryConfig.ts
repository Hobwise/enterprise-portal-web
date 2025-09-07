export const fetchQueryConfig = (options?: any) => {
  return {
    refetchOnWindowFocus: true, // Enable window focus refetching by default
    keepPreviousData: true,
    ...options,
    staleTime: 30 * 1000, // 30 seconds - much more responsive for bulk operations

    cacheTime: 5 * 60 * 1000, // 5 minutes instead of 10 for faster cache cleanup

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
