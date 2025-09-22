'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useGlobalContext } from './globalProvider';

// Global cache for pagination data to persist across component re-renders
const globalPaginationCache = new Map<string, {
  items: any[],
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number
}>();

const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

interface UseCachedPaginationOptions {
  pageSize?: number;
  cacheKey?: string;
  onFetch: (page: number, pageSize: number) => Promise<{
    items: any[];
    totalPages: number;
    totalItems: number;
  }>;
}

export function useCachedPagination(options: UseCachedPaginationOptions) {
  const {
    pageSize = 10,
    cacheKey: baseCacheKey = 'default',
    onFetch
  } = options;

  const { tableStatus } = useGlobalContext();

  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Create cache key with status and page
  const getCacheKey = useCallback((page: number) => {
    return `${baseCacheKey}_${tableStatus}_page_${page}`;
  }, [baseCacheKey, tableStatus]);

  // Check if cache is valid
  const isCacheValid = useCallback((cached: any) => {
    return cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME;
  }, []);

  // Fetch data with caching
  const fetchPage = useCallback(async (page: number, forceRefresh: boolean = false) => {
    const cacheKey = getCacheKey(page);

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = globalPaginationCache.get(cacheKey);
      if (isCacheValid(cached)) {
        setItems(cached.items);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
        setCurrentPage(page);
        return cached;
      }
    }

    // Fetch from API
    setIsLoading(true);
    try {
      const result = await onFetch(page, pageSize);

      // Update state
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setCurrentPage(page);

      // Update cache
      globalPaginationCache.set(cacheKey, {
        items: result.items,
        timestamp: Date.now(),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        currentPage: page
      });

      return result;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCacheKey, isCacheValid, onFetch, pageSize]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPage(page);
    }
  }, [fetchPage, totalPages]);

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  // Handle previous page
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  // Clear cache for current section
  const clearCache = useCallback((clearAll: boolean = false) => {
    if (clearAll) {
      globalPaginationCache.clear();
    } else {
      // Clear all pages for current cache key and status
      const keysToDelete: string[] = [];
      globalPaginationCache.forEach((_, key) => {
        if (key.startsWith(`${baseCacheKey}_${tableStatus}_page_`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => globalPaginationCache.delete(key));
    }
  }, [baseCacheKey, tableStatus]);

  // Invalidate cache for specific patterns
  const invalidateCache = useCallback((pattern?: string) => {
    if (!pattern) {
      clearCache();
      return;
    }

    const keysToDelete: string[] = [];
    globalPaginationCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalPaginationCache.delete(key));
  }, [clearCache]);

  // Initial fetch on mount or when tableStatus changes
  useEffect(() => {
    fetchPage(1);
  }, [tableStatus]); // Re-fetch when status changes

  // Return pagination data and controls
  return {
    // Data
    items,
    currentPage,
    totalPages,
    totalItems,
    isLoading,

    // Controls
    setCurrentPage: handlePageChange,
    handlePageChange,
    handleNextPage,
    handlePreviousPage,

    // Cache management
    clearCache,
    invalidateCache,
    refetch: (page?: number) => fetchPage(page || currentPage, true),

    // For CustomPagination component
    paginationProps: {
      currentPage,
      totalPages,
      onPageChange: handlePageChange,
      onNext: handleNextPage,
      onPrevious: handlePreviousPage
    }
  };
}

// Export cache utilities for external use
export const paginationCacheUtils = {
  clearAll: () => globalPaginationCache.clear(),
  invalidatePattern: (pattern: string) => {
    const keysToDelete: string[] = [];
    globalPaginationCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => globalPaginationCache.delete(key));
  },
  getCacheSize: () => globalPaginationCache.size,
  getCacheKeys: () => Array.from(globalPaginationCache.keys())
};