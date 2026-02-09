'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useInventoryItems, { useMenuSummary } from '@/hooks/cachedEndpoints/useInventoryItems';
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
import SyncMenuItemsModal from '@/components/ui/dashboard/inventory/modals/SyncMenuItemsModal';

export default function ItemsPage() {
  const router = useRouter();
  const { page, setPage } = useGlobalContext();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');
  const pageSize = 10;

  // Debounced search for API
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search effect - also reset page when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (debouncedSearch !== searchQuery) {
        setPage(1);
        setDebouncedSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch, setPage]);

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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Fetch inventory items
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
    page,
    pageSize,
    search: debouncedSearch,
  });

  // Menu summary for sync button
  const {
    data: menuSummaryData,
    isLoading: menuSummaryLoading,
    totalItemCount: syncItemsCount,
  } = useMenuSummary();

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
    notify({ title: 'Success!', text: 'Item updated successfully', type: 'success' });
    setIsEditModalOpen(false);
    setSelectedItem(null);
    refetch();
  }, [refetch]);

  const handleCustomizeMeasurements = useCallback(() => {
    router.push('/dashboard/inventory/items/measurements');
  }, [router]);

  const handleSyncItems = useCallback(() => {
    setIsSyncModalOpen(true);
  }, []);

  const handleSyncConfirm = useCallback(() => {
    setIsSyncModalOpen(false);
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
      notify({ title: 'Error!', text: 'Failed to delete item', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItem, refetch]);

  const handleAddSuccess = useCallback(() => {
    notify({ title: 'Success!', text: 'Item added successfully', type: 'success' });
    refetch();
  }, [refetch]);

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

  // Client-side filtering (including search)
  const filteredItems = useMemo(() => {
    if (!data) return [];
    let items = data;

    // Client-side search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      items = items.filter((item) =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.id?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    if (itemTypeFilter !== 'all') {
      items = items.filter((item) => item.itemType === Number(itemTypeFilter));
    }

    if (stockLevelFilter !== 'all') {
      items = items.filter((item) => {
        const stockLevel = item.stockLevel ?? 0;
        switch (stockLevelFilter) {
          case 'in-stock':
            return stockLevel > 0;
          case 'low-stock':
            return stockLevel > 0 && stockLevel <= item.reorderLevel;
          case 'out-of-stock':
            return stockLevel === 0;
          default:
            return true;
        }
      });
    }

    return items;
  }, [data, searchQuery, itemTypeFilter, stockLevelFilter]);

  // Structure data with pagination info for usePagination hook
  const tableData = useMemo(() => {
    // If we're filtering client-side (search, itemType, or stockLevel), we need to handle pagination ourselves
    const isClientFiltering = searchQuery.trim() !== '' || itemTypeFilter !== 'all' || stockLevelFilter !== 'all';

    if (isClientFiltering) {
      // When filtering client-side, return simple array (usePagination will handle it)
      return filteredItems;
    }

    // When not filtering, pass full pagination info from API
    return {
      data: filteredItems,
      totalCount,
      totalPages,
      currentPage,
      hasNext,
      hasPrevious,
    };
  }, [filteredItems, searchQuery, itemTypeFilter, stockLevelFilter, totalCount, totalPages, currentPage, hasNext, hasPrevious]);

  // Computed values - use filtered count when client-side filtering, otherwise API count
  const isClientFiltering = searchQuery.trim() !== '' || itemTypeFilter !== 'all' || stockLevelFilter !== 'all';
  const totalItems = isClientFiltering ? filteredItems.length : (totalCount || filteredItems.length);

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
            onAddItem={handleAddItem}
            onCustomizeMeasurements={handleCustomizeMeasurements}
            syncItemsCount={syncItemsCount}
            onSyncItems={handleSyncItems}
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

      {/* Sync Menu Items Modal */}
      <SyncMenuItemsModal
        isOpen={isSyncModalOpen}
        onOpenChange={setIsSyncModalOpen}
        data={menuSummaryData}
        isLoading={menuSummaryLoading}
        onSync={handleSyncConfirm}
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
