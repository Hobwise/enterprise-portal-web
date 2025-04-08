export const fetchQueryConfig = (options?: any) => {
  return {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
    staleTime: 1000 * 60 * 30,

    cacheTime: Infinity,

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
