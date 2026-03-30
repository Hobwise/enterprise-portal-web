'use client';
import { useState } from 'react';
import {
  getInventoryCountHistory,
  verifyStockCount,
  VerifyStockCountPayload,
  InventoryCountHistoryItem,
  InventoryCountHistoryResponse,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQueryConfig } from '@/lib/queryConfig';

const useInventoryCount = () => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation?.[0]?.businessId;

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const emptyHistory: InventoryCountHistoryResponse = {
    history: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  // Fetch inventory count history
  const fetchHistory = async (): Promise<InventoryCountHistoryResponse> => {
    if (!businessId) return emptyHistory;

    try {
      const response = await getInventoryCountHistory(businessId, page, pageSize, search || undefined);

      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        return {
          history: (result?.history ?? []) as InventoryCountHistoryItem[],
          totalCount: result?.totalCount ?? 0,
          pageSize: result?.pageSize ?? 10,
          currentPage: result?.currentPage ?? 1,
          totalPages: result?.totalPages ?? 1,
          hasNext: result?.hasNext ?? false,
          hasPrevious: result?.hasPrevious ?? false,
        };
      }

      return emptyHistory;
    } catch (error) {
      return emptyHistory;
    }
  };

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery<InventoryCountHistoryResponse>({
    queryKey: ['inventoryCountHistory', businessId, page, search, pageSize],
    queryFn: fetchHistory,
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  // Verify stock count mutation
  const verifyMutation = useMutation({
    mutationFn: async (payload: VerifyStockCountPayload) => {
      const currentBusiness = getJsonItemFromLocalStorage('business');
      const currentBusinessId = currentBusiness?.[0]?.businessId;
      if (!currentBusinessId) throw new Error('Business ID not found');
      return verifyStockCount(currentBusinessId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Stock count verified successfully', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['inventoryCountHistory'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to verify stock count', type: 'error' });
      }
    },
    onError: () => {
      notify({ title: 'Error!', text: 'Failed to verify stock count', type: 'error' });
    },
  });

  return {
    // History
    history: historyData?.history ?? emptyHistory.history,
    totalCount: historyData?.totalCount ?? emptyHistory.totalCount,
    totalPages: historyData?.totalPages ?? emptyHistory.totalPages,
    currentPage: historyData?.currentPage ?? emptyHistory.currentPage,
    hasNext: historyData?.hasNext ?? emptyHistory.hasNext,
    hasPrevious: historyData?.hasPrevious ?? emptyHistory.hasPrevious,
    isLoadingHistory,
    refetchHistory,

    // Mutation
    verifyStockCount: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,

    // Pagination controls
    page,
    setPage,
    search,
    setSearch,
    pageSize,
    setPageSize,
  };
};

export default useInventoryCount;
