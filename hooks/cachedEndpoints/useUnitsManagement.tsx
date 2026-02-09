'use client';
import {
  getUnitsByBusiness,
  createUnit,
  updateUnit,
  deleteUnit,
  CreateGlobalUnitPayload,
  InventoryUnit,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQueryConfig } from '@/lib/queryConfig';

const useUnitsManagement = () => {
  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation?.[0]?.businessId;

  // Fetch all units
  const fetchUnits = async (): Promise<InventoryUnit[]> => {
    if (!businessId) return [];

    try {
      const response = await getUnitsByBusiness(businessId);

      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        if (Array.isArray(result)) return result as InventoryUnit[];
        if (result?.units && Array.isArray(result.units))
          return result.units as InventoryUnit[];
        return [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryUnit[]>({
    queryKey: ['unitsManagement', businessId],
    queryFn: fetchUnits,
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: async (payload: CreateGlobalUnitPayload) => {
      if (!businessId) throw new Error('Business ID not found');
      return createUnit(businessId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Unit created successfully', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['unitsManagement', businessId] });
        queryClient.invalidateQueries({ queryKey: ['unitsByBusiness'] });
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to create unit', type: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error creating unit:', error);
      notify({ title: 'Error!', text: 'Failed to create unit', type: 'error' });
    },
  });

  // Update unit mutation
  const updateUnitMutation = useMutation({
    mutationFn: async ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: CreateGlobalUnitPayload;
    }) => {
      if (!businessId) throw new Error('Business ID not found');
      return updateUnit(businessId, unitId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Unit updated successfully', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['unitsManagement', businessId] });
        queryClient.invalidateQueries({ queryKey: ['unitsByBusiness'] });
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to update unit', type: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error updating unit:', error);
      notify({ title: 'Error!', text: 'Failed to update unit', type: 'error' });
    },
  });

  // Delete unit mutation
  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      if (!businessId) throw new Error('Business ID not found');
      return deleteUnit(businessId, unitId);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Unit deleted successfully', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['unitsManagement', businessId] });
        queryClient.invalidateQueries({ queryKey: ['unitsByBusiness'] });
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to delete unit', type: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error deleting unit:', error);
      notify({ title: 'Error!', text: 'Failed to delete unit', type: 'error' });
    },
  });

  return {
    data: data || [],
    isLoading,
    isError,
    refetch,
    createUnit: createUnitMutation.mutate,
    isCreating: createUnitMutation.isPending,
    updateUnit: updateUnitMutation.mutate,
    isUpdating: updateUnitMutation.isPending,
    deleteUnit: deleteUnitMutation.mutate,
    isDeleting: deleteUnitMutation.isPending,
  };
};

export default useUnitsManagement;
