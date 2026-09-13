'use client';
import { useState } from 'react';
import { getSuppliersByBusiness, getSupplier, createSupplier, updateSupplier, deleteSupplier, mapSupplierItems, SupplierPayload } from '@/app/api/controllers/dashboard/supplier';
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQueryConfig } from "@/lib/queryConfig";
import { toast } from 'sonner';
import { Supplier } from '@/components/ui/dashboard/inventory/suppliers/types';

export type SupplierData = {
  id: string;
  supplierId: string;
  name: string;
  companyName: string;
  emailAddress: string;
  phoneNumber: string;
  physicalAddress: string;
  isActive: boolean;
  items?: any[];
};

const useSuppliers = () => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation?.[0]?.businessId;

  // Pagination state (1-indexed for CustomPagination compatibility)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Fetch suppliers with pagination metadata
  const fetchSuppliers = async () => {
    if (!businessId) return { suppliers: [], totalCount: 0, totalPages: 0 };

    const clientParameters = {
      page: page - 1, // API is 0-indexed
      search,
      pageSize,
    };

    try {
      const response = await getSuppliersByBusiness(businessId, clientParameters);
      const responseData = response?.data?.data;

      if (responseData) {
        return {
          suppliers: responseData.suppliers || [],
          totalCount: responseData.totalCount ?? 0,
          totalPages: responseData.totalPages ?? Math.ceil((responseData.totalCount ?? 0) / pageSize),
        };
      }

      return { suppliers: [], totalCount: 0, totalPages: 0 };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return { suppliers: [], totalCount: 0, totalPages: 0 };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<{
    suppliers: Supplier[];
    totalCount: number;
    totalPages: number;
  }>({
    queryKey: ["suppliers", businessId, page, search, pageSize],
    queryFn: async () => {
      const { suppliers: apiData, totalCount, totalPages } = await fetchSuppliers();

      const suppliers = apiData.map((s: any) => ({
        id: s.id,
        supplierId: s.supplierId || s.id,
        name: s.name,
        companyName: s.companyName,
        email: s.emailAddress,
        address: s.physicalAddress,
        phoneNumber: s.phoneNumber,
        items: (s.items || []).map((i: any) => ({
          id: i.id,
          name: i.name || i.itemName // Handle potential naming differences
        })),
        status: s.isActive ? 'active' : 'inactive',
        dateCreated: s.dateCreated,
      }));

      return { suppliers, totalCount, totalPages };
    },
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: async (payload: SupplierPayload) => {
      if (!businessId) throw new Error('Business ID not found');
      return createSupplier(businessId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        toast.success('Supplier registered successfully');
        // Invalidate and refetch suppliers
        queryClient.invalidateQueries({ queryKey: ["suppliers", businessId] });
      } else {
        toast.error(response?.data?.error || 'Failed to register supplier');
      }
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast.error('Failed to register supplier');
    },
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async ({ supplierId, payload }: { supplierId: string; payload: SupplierPayload }) => {
      if (!businessId) throw new Error('Business ID not found');
      return updateSupplier(businessId, supplierId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        toast.success('Supplier updated successfully');
        // Invalidate and refetch suppliers
        queryClient.invalidateQueries({ queryKey: ["suppliers", businessId] });
      } else {
        toast.error(response?.data?.error || 'Failed to update supplier');
      }
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast.error('Failed to update supplier');
    },
  });

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      return deleteSupplier(supplierId);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        toast.success('Supplier deleted successfully');
        // Invalidate and refetch suppliers
        queryClient.invalidateQueries({ queryKey: ["suppliers", businessId] });
      } else {
        toast.error(response?.data?.error || 'Failed to delete supplier');
      }
    },
    onError: (error) => {
      console.error('Error deleting supplier:', error);
      toast.error('Failed to delete supplier');
    },
  });

  // Force refresh function that bypasses cache
  const forceRefresh = () => {
    return refetch({ 
      throwOnError: false,
      cancelRefetch: true 
    });
  };

  const mapSupplierItemsMutation = useMutation({
    mutationFn: async ({ supplierId, items }: { supplierId: string; items: { id: string; name: string }[] }) => {
      if (!businessId) throw new Error('Business ID not found');
      return mapSupplierItems(businessId, supplierId, items);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        toast.success('Items mapped successfully');
        queryClient.invalidateQueries({ queryKey: ["suppliers", businessId] });
        queryClient.invalidateQueries({ queryKey: ["supplier"] });
      } else {
        toast.error(response?.data?.error || 'Failed to map items');
      }
    },
    onError: (error) => {
      console.error('Error mapping items:', error);
      toast.error('Failed to map items');
    },
  });

  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return {
    data: data?.suppliers || [],
    isLoading,
    isError,
    refetch,
    forceRefresh,
    createSupplier: createSupplierMutation.mutate,
    isCreating: createSupplierMutation.isPending,
    updateSupplier: updateSupplierMutation.mutate,
    isUpdating: updateSupplierMutation.isPending,
    deleteSupplier: deleteSupplierMutation.mutate,
    isDeleting: deleteSupplierMutation.isPending,
    mapSupplierItems: mapSupplierItemsMutation.mutate,
    isMappingItems: mapSupplierItemsMutation.isPending,
    // Pagination
    page,
    setPage,
    search,
    setSearch,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};



export const useSupplierDetail = (supplierId: string | undefined) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => {
      const response = await getSupplier(supplierId!);
      return response?.data?.data;
    },
    enabled: !!supplierId,
    ...fetchQueryConfig(),
  });

  return { data, isLoading, isError };
};

export default useSuppliers;
