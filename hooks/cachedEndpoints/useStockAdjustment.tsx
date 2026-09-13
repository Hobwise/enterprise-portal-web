'use client';
import { useState } from 'react';
import {
  getStockAdjustmentHistory,
  getStockAdjustmentReasons,
  submitStockAdjustment,
  SubmitStockAdjustmentPayload,
  StockAdjustmentReason,
  StockAdjustmentHistoryItem,
  StockAdjustmentHistoryResponse,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQueryConfig } from '@/lib/queryConfig';

const useStockAdjustment = () => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation?.[0]?.businessId;

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [itemType, setItemType] = useState<number | undefined>(undefined);

  const emptyHistory: StockAdjustmentHistoryResponse = {
    history: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  // Fetch adjustment history
  const fetchHistory = async (): Promise<StockAdjustmentHistoryResponse> => {
    if (!businessId) return emptyHistory;

    try {
      const response = await getStockAdjustmentHistory(businessId, page, pageSize, search || undefined, itemType);

      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        return {
          history: (result?.history ?? []) as StockAdjustmentHistoryItem[],
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
      console.error('Error fetching stock adjustment history:', error);
      return emptyHistory;
    }
  };

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery<StockAdjustmentHistoryResponse>({
    queryKey: ['stockAdjustmentHistory', businessId, page, search, pageSize, itemType],
    queryFn: fetchHistory,
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  // Fetch adjustment reasons
  const fetchReasons = async (): Promise<StockAdjustmentReason[]> => {
    if (!businessId) return [];

    try {
      const response = await getStockAdjustmentReasons(businessId);

      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        return Array.isArray(result) ? result as StockAdjustmentReason[] : [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching stock adjustment reasons:', error);
      return [];
    }
  };

  const {
    data: reasons,
    isLoading: isLoadingReasons,
  } = useQuery<StockAdjustmentReason[]>({
    queryKey: ['stockAdjustmentReasons', businessId],
    queryFn: fetchReasons,
    enabled: !!businessId,
    ...fetchQueryConfig({ staleTime: 30 * 60 * 1000 }),
  });

  // Submit adjustment mutation — reads cooperateID/businessID fresh to avoid stale closures
  const adjustmentMutation = useMutation({
    mutationFn: async (payload: SubmitStockAdjustmentPayload) => {
      const currentBusiness = getJsonItemFromLocalStorage('business');
      const currentBusinessId = currentBusiness?.[0]?.businessId;
      if (!currentBusinessId) throw new Error('Business ID not found');
      return submitStockAdjustment(currentBusinessId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Stock adjustment submitted successfully', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['stockAdjustmentHistory'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to submit stock adjustment', type: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error submitting stock adjustment:', error);
      notify({ title: 'Error!', text: 'Failed to submit stock adjustment', type: 'error' });
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

    // Reasons
    reasons: reasons ?? [],
    isLoadingReasons,

    // Mutation
    submitAdjustment: adjustmentMutation.mutate,
    isSubmitting: adjustmentMutation.isPending,

    // Pagination controls
    page,
    setPage,
    search,
    setSearch,
    pageSize,
    setPageSize,
    itemType,
    setItemType,
  };
};

export default useStockAdjustment;
