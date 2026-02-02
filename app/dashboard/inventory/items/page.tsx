'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useInventoryItems from '@/hooks/cachedEndpoints/useInventoryItems';
import { deleteInventoryItem, InventoryItem, PendingRecipeTracking } from '@/app/api/controllers/dashboard/inventory';
import EditInventoryItemModal from '@/components/ui/dashboard/inventory/modals/EditInventoryItemModal';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useGlobalContext } from '@/hooks/globalProvider';
import InventoryItemsHeader from '@/components/ui/dashboard/inventory/InventoryItemsHeader';
import InventoryItemsTable from '@/components/ui/dashboard/inventory/InventoryItemsTable';
import AddInventoryItemModal from '@/components/ui/dashboard/inventory/modals/AddInventoryItemModal';
import AddRecipeModal from '@/components/ui/dashboard/inventory/modals/AddRecipeModal';
import InventoryItemDetailsModal from '@/components/ui/dashboard/inventory/modals/InventoryItemDetailsModal';
import BatchProductionModal from '@/components/ui/dashboard/inventory/modals/BatchProductionModal';
import RecipeRequiredModal from '@/components/ui/dashboard/inventory/modals/RecipeRequiredModal';
import DeleteModal from '@/components/ui/deleteModal';

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

  // Recipe enforcement via localStorage
  useEffect(() => {
    const pending = localStorage.getItem('pendingRecipeTracking');
    if (pending) {
      try {
        const tracking = JSON.parse(pending) as PendingRecipeTracking;
        setPendingTracking(tracking);
        setPendingProducedItemId(tracking.inventoryItemId);
        setIsRecipeModalOpen(true);
      } catch {
        localStorage.removeItem('pendingRecipeTracking');
      }
    }
  }, []);

  // Fetch inventory items
  const { data, isLoading, refetch } = useInventoryItems({
    page,
    pageSize,
    search: debouncedSearch,
  });

  // Handle search with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [setPage]);

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

  const handleCustomizeMeasurements = useCallback(() => {
    router.push('/dashboard/inventory/items/measurements');
  }, [router]);

  const handleSyncItems = useCallback(() => {
    // TODO: Implement sync items functionality
    toast('Sync Items functionality coming soon');
  }, []);

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
        toast.success('Item deleted successfully');
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        refetch();
      } else {
        toast.error(response?.data?.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItem, refetch]);

  const handleAddSuccess = useCallback(() => {
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
    setIsBatchProductionModalOpen(false);
    setSelectedItem(null);
    refetch();
  }, [refetch]);

  const handleRowClick = useCallback((item: InventoryItem) => {
    router.push(`/dashboard/inventory/items/${item.id}`);
  }, [router]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!data) return [];
    let items = data;

    if (itemTypeFilter !== 'all') {
      items = items.filter((item) => item.itemType === Number(itemTypeFilter));
    }

    if (stockLevelFilter !== 'all') {
      items = items.filter((item) => {
        const hasStocks = item.stocks && item.stocks.length > 0;
        switch (stockLevelFilter) {
          case 'in-stock':
            return hasStocks;
          case 'low-stock':
            return hasStocks && item.reorderLevel > 0;
          case 'out-of-stock':
            return !hasStocks;
          default:
            return true;
        }
      });
    }

    return items;
  }, [data, itemTypeFilter, stockLevelFilter]);

  // Computed values
  const totalItems = filteredData.length;

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
            syncItemsCount={48}
            onSyncItems={handleSyncItems}
          />
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl  overflow-hidden">
          <InventoryItemsTable
            data={filteredData}
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
