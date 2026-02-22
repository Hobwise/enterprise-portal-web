'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuSummary, useSuppliers, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';
import {
  MenuSummaryCategory,
  PredictedInventoryItem,
  PredictInventoryPayload,
  predictInventoryItems,
  synchronizeInventoryItems,
  SynchronizeInventoryPayload,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  SelectStep,
  ProcessingStep,
  ConfirmStep,
} from '@/components/ui/dashboard/inventory/modals/SyncMenuItemsModal';
import type { ModalStep, EditableItemData } from '@/components/ui/dashboard/inventory/modals/SyncMenuItemsModal';

export default function SyncMenuPage() {
  const router = useRouter();
  const { data: menuSummaryData = [], isLoading: menuSummaryLoading } = useMenuSummary();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<ModalStep>('select');
  const [predictedItems, setPredictedItems] = useState<PredictedInventoryItem[]>([]);
  const [editableData, setEditableData] = useState<EditableItemData[]>([]);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const abortRef = useRef(false);

  const statusMessages = [
    'Analyzing menu items...',
    'Predicting inventory details...',
    'Almost there...',
  ];

  // Cycle status messages during processing step
  useEffect(() => {
    if (step !== 'processing') return;
    setStatusMessageIndex(0);
    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [step]);

  // Call predict API when entering processing step
  useEffect(() => {
    if (step !== 'processing') return;
    abortRef.current = false;

    const runPredict = async () => {
      try {
        const business = getJsonItemFromLocalStorage('business');
        const businessId = business?.[0]?.businessId;

        const payload: PredictInventoryPayload = [];
        menuSummaryData.forEach((category) => {
          category.items.forEach((item) => {
            if (selectedItems.has(item.itemId)) {
              payload.push({
                menuItemId: item.itemId,
                menuItemName: item.itemName,
                menuName: category.menuName,
                itemDescription: item.itemDescription || '',
              });
            }
          });
        });

        const response = await predictInventoryItems(businessId, payload);

        if (abortRef.current) return;
        if (!response) return;

        if (response?.data?.isSuccessful) {
          const items = response.data.data || response.data;
          const itemsArray = Array.isArray(items) ? items : [];
          setPredictedItems(itemsArray);
          setEditableData(itemsArray.map((item) => ({
            costPerUnit: '',
            salesPrice: '',
            itemType: String(item.suggestedItemType ?? 0),
            unitId: item.suggestedUnitId ?? '',
            supplierId: '',
            strictnessLevel: '0',
            openingStock: '',
          })));
          setStep('confirm');
        } else {
          notify({
            title: 'Error',
            text: response?.data?.error || 'Failed to predict inventory items',
            type: 'error',
          });
          setStep('select');
        }
      } catch (error) {
        if (abortRef.current) return;
        setStep('select');
      }
    };

    runPredict();
  }, [step, menuSummaryData, selectedItems]);

  // All item IDs across all categories
  const allItemIds = useMemo(() => {
    const ids: string[] = [];
    menuSummaryData.forEach((cat) => cat.items.forEach((item) => ids.push(item.itemId)));
    return ids;
  }, [menuSummaryData]);

  const totalItems = allItemIds.length;
  const allSelected = totalItems > 0 && selectedItems.size === totalItems;

  const toggleCategory = useCallback((menuId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) setSelectedItems(new Set());
    else setSelectedItems(new Set(allItemIds));
  }, [allSelected, allItemIds]);

  const toggleCategorySelection = useCallback((category: MenuSummaryCategory) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      const categoryItemIds = category.items.map((i) => i.itemId);
      const allCategorySelected = categoryItemIds.every((id) => next.has(id));
      if (allCategorySelected) categoryItemIds.forEach((id) => next.delete(id));
      else categoryItemIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const getCategoryState = useCallback(
    (category: MenuSummaryCategory) => {
      const categoryItemIds = category.items.map((i) => i.itemId);
      const selectedCount = categoryItemIds.filter((id) => selectedItems.has(id)).length;
      if (selectedCount === 0) return 'none';
      if (selectedCount === categoryItemIds.length) return 'all';
      return 'some';
    },
    [selectedItems]
  );

  const handleStartPredict = useCallback(() => {
    setStep('processing');
  }, []);

  const handleConfirmSync = useCallback(async () => {
    const business = getJsonItemFromLocalStorage('business');
    const businessId = business?.[0]?.businessId;

    const payload: SynchronizeInventoryPayload = predictedItems.map((item, idx) => ({
      menuItemId: item.menuItemId,
      inventoryItemName: item.suggestedInventoryItemName,
      unitCategory: item.suggestedUnitCategory,
      unitId: editableData[idx]?.unitId || item.suggestedUnitId || '',
      itemType: editableData[idx]?.itemType ? Number(editableData[idx].itemType) : (item.suggestedItemType ?? 0),
      strictnessLevel: editableData[idx]?.strictnessLevel ? Number(editableData[idx].strictnessLevel) : 0,
      openingStock: editableData[idx]?.openingStock ? Number(editableData[idx].openingStock) : 0,
      supplierId: editableData[idx]?.supplierId || '',
    }));

    setIsSyncing(true);
    try {
      const response = await synchronizeInventoryItems(businessId, payload);

      if (!response) return;

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Items synced to inventory successfully', type: 'success' });
        router.push('/dashboard/inventory/items');
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to sync items to inventory', type: 'error' });
      }
    } catch (error) {
      // handleError already shows error toast
    } finally {
      setIsSyncing(false);
    }
  }, [router, predictedItems, editableData]);

  const handleBackToSelect = useCallback(() => {
    setStep('select');
  }, []);

  const handleClose = useCallback(() => {
    router.push('/dashboard/inventory/items');
  }, [router]);

  return (
    <div className="min-h-screen font-satoshi">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-h-[85vh] flex flex-col">
          {step === 'select' && (
            <SelectStep
              data={menuSummaryData}
              isLoading={menuSummaryLoading}
              selectedItems={selectedItems}
              expandedCategories={expandedCategories}
              allSelected={allSelected}
              totalItems={totalItems}
              onClose={handleClose}
              toggleSelectAll={toggleSelectAll}
              toggleCategory={toggleCategory}
              toggleCategorySelection={toggleCategorySelection}
              toggleItem={toggleItem}
              getCategoryState={getCategoryState}
              onSync={handleStartPredict}
            />
          )}

          {step === 'processing' && (
            <ProcessingStep
              itemCount={selectedItems.size}
              statusMessage={statusMessages[statusMessageIndex]}
              onClose={handleClose}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              predictedItems={predictedItems}
              editableData={editableData}
              onEditableChange={setEditableData}
              onBack={handleBackToSelect}
              onSync={handleConfirmSync}
              onClose={handleClose}
              isSyncing={isSyncing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
