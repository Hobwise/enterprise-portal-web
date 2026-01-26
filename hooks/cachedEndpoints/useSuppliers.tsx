'use client';
import { getSuppliersByBusiness, createSupplier, updateSupplier, deleteSupplier, SupplierPayload } from '@/app/api/controllers/dashboard/supplier';
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

  // Fetch all suppliers
  const getAllSuppliers = async () => {
    if (!businessId) return [];
    
    try {
      const response = await getSuppliersByBusiness(businessId);
      
      if (response?.data?.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<Supplier[]>({
    queryKey: ["suppliers", businessId],
    queryFn: async () => {
      const apiData = await getAllSuppliers();
      // Map API data to UI Supplier type
      return apiData.map((s: any) => ({
        id: s.id,
        supplierId: s.supplierId || s.id,
        name: s.name,
        companyName: s.companyName,
        email: s.emailAddress,
        address: s.physicalAddress,
        phoneNumber: s.phoneNumber,
        items: s.items || [],
        status: s.isActive ? 'active' : 'inactive',
      }));
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

  return {
    data: data || [],
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
  };
};

// ... existing code ...

export default useSuppliers;
