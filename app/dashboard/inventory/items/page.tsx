'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useInventoryItems from '@/hooks/cachedEndpoints/useInventoryItems';
import { deleteInventoryItem, InventoryItem, PendingRecipeTracking } from '@/app/api/controllers/dashboard/inventory';
import EditInventoryItemModal from '@/components/ui/dashboard/inventory/modals/EditInventoryItemModal';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { useGlobalContext } from '@/hooks/globalProvider';
import InventoryItemsHeader from '@/components/ui/dashboard/inventory/InventoryItemsHeader';
import InventoryItemsTable from '@/components/ui/dashboard/inventory/InventoryItemsTable';
import AddInventoryItemModal from '@/components/ui/dashboard/inventory/modals/AddInventoryItemModal';
import AddRecipeModal from '@/components/ui/dashboard/inventory/modals/AddRecipeModal';
import InventoryItemDetailsModal from '@/components/ui/dashboard/inventory/modals/InventoryItemDetailsModal';
import BatchProductionModal from '@/components/ui/dashboard/inventory/modals/BatchProductionModal';
import RecipeRequiredModal from '@/components/ui/dashboard/inventory/modals/RecipeRequiredModal';
import DeleteModal from '@/components/ui/deleteModal';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';

// Matches the boundary logic in InventoryItemsTable's getStockBarColor
function getStockStatus(item: InventoryItem): string {
  const stock = item.stockLevel ?? 0;
  const reorder = item.reorderLevel ?? 0;
  if (stock === 0) return 'out-of-stock';
  if (stock <= reorder) return 'low-stock';
  return 'in-stock';
}

export default function ItemsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { page, setPage } = useGlobalContext();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');
  const pageSize = 10;

  // Debounced search for API
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const hasActiveFilters = itemTypeFilter !== 'all' || stockLevelFilter !== 'all';

  const handleClearFilters = useCallback(() => {
    setItemTypeFilter('all');
    setStockLevelFilter('all');
  }, []);

  // Debounce search effect - also reset page when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [itemTypeFilter, stockLevelFilter, setPage]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [pendingProducedItemId, setPendingProducedItemId] = useState<string | null>(null);
  const [pendingTracking, setPendingTracking] = useState<PendingRecipeTracking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBatchProductionModalOpen, setIsBatchProductionModalOpen] = useState(false);
  const [isRecipeRequiredModalOpen, setIsRecipeRequiredModalOpen] = useState(false);

  // When dropdown filters are active, fetch a larger batch for client-side filtering.
  // This ensures filtered results are accurate across the full dataset.
  const FILTERED_BATCH_SIZE = 200;

  const {
    data,
    isLoading,
    refetch,
    totalCount,
    totalPages,
    currentPage,
    hasNext,
    hasPrevious,
  } = useInventoryItems({
    page: hasActiveFilters ? 1 : page,
    pageSize: hasActiveFilters ? FILTERED_BATCH_SIZE : pageSize,
    search: debouncedSearch.trim() || undefined,
  });

  // Recipe enforcement via localStorage
  useEffect(() => {
    // Wait for data to load before processing localStorage
    if (isLoading || !data) return;

    const pending = localStorage.getItem('pendingRecipeTracking');
    if (pending) {
      try {
        const tracking = JSON.parse(pending) as PendingRecipeTracking;

        // Validate item ID exists in actual API data
        const itemExists = data.some(item => item.id === tracking.inventoryItemId);

        if (itemExists) {
          setPendingTracking(tracking);
          setPendingProducedItemId(tracking.inventoryItemId);
          setIsRecipeModalOpen(true);
        } else {
          // Item not found in API data - clear stale localStorage
          localStorage.removeItem('pendingRecipeTracking');
        }
      } catch {
        localStorage.removeItem('pendingRecipeTracking');
      }
    }
  }, [isLoading, data]);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Item actions
  const handleAddItem = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleViewItem = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  }, []);

  const handleEditItem = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
    refetch();
  }, [refetch]);

  const handleDeleteClick = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await deleteInventoryItem(
        business[0]?.businessId,
        selectedItem.id
      );

      if (!response) return;

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Item deleted successfully', type: 'success' });
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        refetch();
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to delete item', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItem, refetch]);

  const handleAddSuccess = useCallback(() => {
    notify({ title: 'Success!', text: 'Item added successfully', type: 'success' });
    refetch();
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
  }, [refetch, queryClient]);

  const handleOpenRecipeModal = useCallback((tracking: PendingRecipeTracking) => {
    setPendingTracking(tracking);
    setPendingProducedItemId(tracking.inventoryItemId);
    setIsRecipeModalOpen(true);
  }, []);

  const handleRecipeCloseWithoutCompletion = useCallback((tracking: PendingRecipeTracking) => {
    localStorage.setItem('pendingRecipeTracking', JSON.stringify(tracking));
    setPendingTracking(tracking);
  }, []);

  const handleRecipeSuccess = useCallback(() => {
    notify({ title: 'Success!', text: 'Recipe created successfully', type: 'success' });
    localStorage.removeItem('pendingRecipeTracking');
    setPendingTracking(null);
    setPendingProducedItemId(null);
    setIsRecipeModalOpen(false);
    setIsRecipeRequiredModalOpen(false);
    refetch();
  }, [refetch]);

 
  const handleBatchProduction = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setIsBatchProductionModalOpen(true);
  }, []);

  const handleBatchProductionSuccess = useCallback(() => {
    notify({ title: 'Success!', text: 'Batch production completed successfully', type: 'success' });
    setIsBatchProductionModalOpen(false);
    setSelectedItem(null);
    refetch();
  }, [refetch]);

  const handleRowClick = useCallback((item: InventoryItem) => {
    router.push(`/dashboard/inventory/items/${item.id}`);
  }, [router]);

  // Apply client-side filters (item type & stock level) on fetched data
  const filteredData = useMemo(() => {
    let items = data || [];

    if (itemTypeFilter !== 'all') {
      const typeNum = parseInt(itemTypeFilter, 10);
      items = items.filter(item => item.itemType === typeNum);
    }

    if (stockLevelFilter !== 'all') {
      items = items.filter(item => getStockStatus(item) === stockLevelFilter);
    }

    return items;
  }, [data, itemTypeFilter, stockLevelFilter]);

  // When filters are active, paginate the filtered results client-side
  const clientPaginatedData = useMemo(() => {
    if (!hasActiveFilters) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, hasActiveFilters, page, pageSize]);

  const filteredTotalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Structure data with pagination info for usePagination hook
  const tableData = useMemo(() => {
    if (hasActiveFilters) {
      return {
        data: clientPaginatedData,
        totalCount: filteredData.length,
        totalPages: filteredTotalPages,
        currentPage: page,
        hasNext: page < filteredTotalPages,
        hasPrevious: page > 1,
      };
    }
    return {
      data: filteredData,
      totalCount,
      totalPages,
      currentPage,
      hasNext,
      hasPrevious,
    };
  }, [hasActiveFilters, clientPaginatedData, filteredData, filteredTotalPages, page, totalCount, totalPages, currentPage, hasNext, hasPrevious]);

  // Computed values
  const totalItems = hasActiveFilters ? filteredData.length : (totalCount || 0);

  if (isLoading && (!data || data.length === 0) && page === 1) {
    return <CustomLoading />;
  }

  return (
    <div className="min-h-screen font-satoshi">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with search, filters, and action buttons */}
        <div className="">
          <InventoryItemsHeader
            totalItems={totalItems}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            itemTypeFilter={itemTypeFilter}
            onItemTypeFilterChange={setItemTypeFilter}
            stockLevelFilter={stockLevelFilter}
            onStockLevelFilterChange={setStockLevelFilter}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onAddItem={handleAddItem}
          />
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl  overflow-hidden">
          <InventoryItemsTable
            data={tableData}
            isLoading={isLoading}
            onViewItem={handleRowClick}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteClick}
            onBatchProduction={handleBatchProduction}
          />
        </div>
      </div>

      {/* Add Item Modal */}
      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleAddSuccess}
        onOpenRecipeModal={handleOpenRecipeModal}
      />

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isRecipeModalOpen}
        onOpenChange={setIsRecipeModalOpen}
        onSuccess={handleRecipeSuccess}
        producedInventoryItemID={pendingProducedItemId || undefined}
        trackingId={pendingTracking?.trackingId}
        itemName={pendingTracking?.itemName}
        onCloseWithoutCompletion={handleRecipeCloseWithoutCompletion}
      />

      {/* Edit Item Modal */}
      <EditInventoryItemModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        item={selectedItem}
        onSuccess={handleEditSuccess}
      />

      {/* Item Details Modal */}
      <InventoryItemDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        item={selectedItem}
        onEdit={handleEditItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        toggleModal={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        handleDelete={handleDeleteConfirm}
        isLoading={isDeleting}
        text={`Are you sure you want to delete "${selectedItem?.name}"?`}
      />

      {/* Batch Production Modal */}
      <BatchProductionModal
        isOpen={isBatchProductionModalOpen}
        onOpenChange={setIsBatchProductionModalOpen}
        onSuccess={handleBatchProductionSuccess}
        item={selectedItem}
      />

      {/* Recipe Required Modal */}
      <RecipeRequiredModal
        isOpen={isRecipeRequiredModalOpen}
        onOpenChange={setIsRecipeRequiredModalOpen}
        onAddRecipe={() => {
          setIsRecipeRequiredModalOpen(false);
          if (selectedItem) {
            const trackingData: PendingRecipeTracking = {
              trackingId: crypto.randomUUID(),
              inventoryItemId: selectedItem.id,
              itemName: selectedItem.name,
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem('pendingRecipeTracking', JSON.stringify(trackingData));
            setPendingTracking(trackingData);
            setPendingProducedItemId(selectedItem.id);
            setIsRecipeModalOpen(true);
          }
        }}
        itemName={selectedItem?.name || ''}
      />
    </div>
  );
}
