'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Switch } from '@nextui-org/react';
import { ChevronDown, RefreshCw, Sparkles, X } from 'lucide-react';
import {
  MenuSummaryCategory,
  PredictedInventoryItem,
  PredictInventoryPayload,
  predictInventoryItems,
  synchronizeInventoryItems,
  SynchronizeInventoryPayload,
  InventoryItemType,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { useSuppliers, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';
import WizardHeader from '../WizardHeader';

type Phase = 'toggle' | 'select' | 'processing' | 'confirm';

type EditableItemData = {
  costPerUnit: string;
  salesPrice: string;
  itemType: string;
  unitId: string;
  supplierId: string;
  strictnessLevel: string;
  openingStock: string;
};

interface SyncStepProps {
  inventorySyncEnabled: boolean;
  onUpdate: (enabled: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  menuSummaryData: MenuSummaryCategory[] | undefined;
  menuSummaryLoading: boolean;
  onSyncComplete: () => void;
}

const SyncStep: React.FC<SyncStepProps> = ({
  inventorySyncEnabled,
  onUpdate,
  onNext,
  onBack,
  menuSummaryData,
  menuSummaryLoading,
  onSyncComplete,
}) => {
  const [phase, setPhase] = useState<Phase>('toggle');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [predictedItems, setPredictedItems] = useState<PredictedInventoryItem[]>([]);
  const [editableData, setEditableData] = useState<EditableItemData[]>([]);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const abortRef = useRef(false);

  const { data: unitsByBusiness, isLoading: unitsLoading } = useUnitsByBusiness();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();

  const data = menuSummaryData ?? [];

  const statusMessages = [
    'Analyzing menu items...',
    'Predicting inventory details...',
    'Almost there...',
  ];

  // Cycle status messages during processing phase
  useEffect(() => {
    if (phase !== 'processing') return;
    setStatusMessageIndex(0);
    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  // Call predict API when entering processing phase
  useEffect(() => {
    if (phase !== 'processing') return;
    abortRef.current = false;

    const runPredict = async () => {
      try {
        const business = getJsonItemFromLocalStorage('business');
        const businessId = business?.[0]?.businessId;

        const payload: PredictInventoryPayload = [];
        data.forEach((category) => {
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

        if (response?.data?.isSuccessful) {
          const items = response.data.data || response.data;
          const itemsArray = Array.isArray(items) ? items : [];
          setPredictedItems(itemsArray);
          setEditableData(
            itemsArray.map((item) => ({
              costPerUnit: '',
              salesPrice: '',
              itemType: String(item.suggestedItemType ?? 0),
              unitId: item.suggestedUnitId ?? '',
              supplierId: '',
              strictnessLevel: '0',
              openingStock: '',
            }))
          );
          setPhase('confirm');
        } else {
          notify({
            title: 'Error',
            text: response?.data?.error || 'Failed to predict inventory items',
            type: 'error',
          });
          setPhase('select');
        }
      } catch (error) {
        if (abortRef.current) return;
        notify({
          title: 'Error',
          text: 'Failed to analyze menu items. Please try again.',
          type: 'error',
        });
        setPhase('select');
      }
    };

    runPredict();
  }, [phase, data, selectedItems]);

  // All item IDs across all categories
  const allItemIds = useMemo(() => {
    const ids: string[] = [];
    data.forEach((cat) => cat.items.forEach((item) => ids.push(item.itemId)));
    return ids;
  }, [data]);

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

  const handleToggle = (enabled: boolean) => {
    onUpdate(enabled);
    if (enabled) {
      setPhase('select');
    }
  };

  const handleSaveAndContinue = () => {
    localStorage.setItem('hobwiseInventorySyncEnabled', JSON.stringify(inventorySyncEnabled));
    onNext();
  };

  const handleStartPredict = useCallback(() => {
    setPhase('processing');
  }, []);

  const handleBackToToggle = useCallback(() => {
    abortRef.current = true;
    onUpdate(false);
    setPhase('toggle');
  }, [onUpdate]);

  const handleBackToSelect = useCallback(() => {
    setPhase('select');
  }, []);

  const handleConfirmSync = useCallback(async () => {
    const business = getJsonItemFromLocalStorage('business');
    const businessId = business?.[0]?.businessId;

    const payload: SynchronizeInventoryPayload = predictedItems.map((item, idx) => ({
      menuItemId: item.menuItemId,
      inventoryItemName: item.suggestedInventoryItemName,
      unitCategory: item.suggestedUnitCategory,
      unitId: editableData[idx]?.unitId || item.suggestedUnitId || '',
      itemType: editableData[idx]?.itemType
        ? Number(editableData[idx].itemType)
        : (item.suggestedItemType ?? 0),
      strictnessLevel: editableData[idx]?.strictnessLevel
        ? Number(editableData[idx].strictnessLevel)
        : 0,
      openingStock: editableData[idx]?.openingStock
        ? Number(editableData[idx].openingStock)
        : 0,
      supplierId: editableData[idx]?.supplierId || '',
    }));

    setIsSyncing(true);
    try {
      const response = await synchronizeInventoryItems(businessId, payload);

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Items synced to inventory successfully', type: 'success' });
        onSyncComplete();
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to sync items to inventory', type: 'error' });
      }
    } catch (error) {
      // Interceptor already shows error toast
    } finally {
      setIsSyncing(false);
    }
  }, [onSyncComplete, predictedItems, editableData]);

  const handleEditableChange = (idx: number, field: keyof EditableItemData, value: string) => {
    setEditableData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const selectClass =
    'w-full px-2 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5F35D2] focus:border-[#5F35D2] bg-white appearance-none';

  // ── Toggle Phase ────────────────────────────────────────────────────
  if (phase === 'toggle') {
    return (
      <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
        <WizardHeader currentStep={2} />

        <div className="flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
            Enable Inventory Sync
          </h2>
          <p className="text-base text-gray-600 text-center max-w-lg mb-8">
            Turn on Inventory sync. This will synchronize menu and inventory items for effective
            tracking
          </p>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Inventory Sync</p>
                <p className="text-sm text-gray-500">Click to enable</p>
              </div>
            </div>
            <Switch
              isSelected={inventorySyncEnabled}
              onValueChange={handleToggle}
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
              }}
            />
          </div>

          <p className="font-semibold text-gray-700 mb-4">When you enable Inventory Sync</p>

          <ul className="space-y-3 mb-10">
            {[
              'Maps inventory items to menu items',
              'No Stock enforcement yet — sales can continue normally',
              'You can setup item and add recipe at your pace.',
              'All actions are editable to make adjustments as you expand.',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#5F35D2] mt-1 text-sm shrink-0">&#9679;</span>
                <span className="text-sm text-gray-600">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center w-full mt-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <span>&larr;</span>
            <span>Back</span>
          </button>
          <button
            onClick={handleSaveAndContinue}
            className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200"
          >
            <span>Save & Continue</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Select Phase ────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
        <WizardHeader currentStep={2} />

        {/* Side-by-side: toggle info left, sync card right */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 items-start mt-4">
          {/* Left — toggle info */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center lg:pt-8">
            <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3">
              Enable Inventory Sync
            </h2>
            <p className="text-base text-gray-600 max-w-md mb-8">
              Turn on Inventory sync. This will synchronize menu and inventory items for effective
              tracking
            </p>

            <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Inventory Sync</p>
                  <p className="text-sm text-gray-500">Click to enable</p>
                </div>
              </div>
              <Switch
                isSelected={inventorySyncEnabled}
                onValueChange={handleToggle}
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
                }}
              />
            </div>
          </div>

          {/* Right — sync card */}
          <div className="w-full lg:w-[55%] bg-white rounded-2xl border border-gray-200 flex flex-col max-h-[60vh]">
            {/* Close button */}
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={handleBackToToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Header */}
            <div className="text-center px-6 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Sync Menu Items</h2>
              <p className="text-sm text-gray-500 mt-1">
                Swiftly Synchronize menu item to your inventory with ease in group or singles
              </p>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {menuSummaryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[#5F35D2]/20 border-t-[#5F35D2] rounded-full animate-spin" />
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="font-semibold text-gray-600">No menu items to sync</p>
                  <p className="text-sm mt-1 text-gray-400">
                    All menu items are already synced to inventory
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Select category or Item
                  </p>

                  {/* Select All Row */}
                  <div
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleSelectAll}
                  >
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && selectedItems.size > 0}
                    />
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Select all synced
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{totalItems}</span>
                  </div>

                  {/* Category Rows */}
                  {data.map((category) => {
                    const isExpanded = expandedCategories.has(category.menuId);
                    const categoryState = getCategoryState(category);

                    return (
                      <div
                        key={category.menuId}
                        className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategorySelection(category);
                            }}
                          >
                            <Checkbox
                              checked={categoryState === 'all'}
                              indeterminate={categoryState === 'some'}
                            />
                          </div>
                          <div
                            className="flex items-center gap-3 flex-1"
                            onClick={() => toggleCategory(category.menuId)}
                          >
                            <span className="text-sm font-medium text-gray-700 flex-1">
                              {category.menuName}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {category.itemCount}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? '' : 'rotate-[-90deg]'
                              }`}
                            />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/50 ml-3">
                            {category.items.map((item) => (
                              <div
                                key={item.itemId}
                                className="flex items-center gap-3 pl-10 pr-6 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleItem(item.itemId)}
                              >
                                <Checkbox checked={selectedItems.has(item.itemId)} />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#5F35D2]/30 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{item.itemName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex justify-between items-center w-full mt-6">
          <button
            onClick={handleBackToToggle}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <span>&larr;</span>
            <span>Back</span>
          </button>
          <button
            onClick={handleStartPredict}
            disabled={selectedItems.size === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>
              {selectedItems.size > 0
                ? `Sync ${selectedItems.size} Item${selectedItems.size !== 1 ? 's' : ''} to Inventory`
                : 'Sync Items to Inventory'}
            </span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Processing Phase ────────────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
        <WizardHeader currentStep={2} />

        <div className="flex-1 flex flex-col items-center justify-center py-12">
          {/* Animated icon */}
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full bg-[#5F35D2]/20 animate-ping" />
            <div className="absolute inset-1 rounded-full bg-[#5F35D2]/10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#5F35D2]/10 flex items-center justify-center">
                <Sparkles
                  className="w-7 h-7 text-[#5F35D2] animate-spin"
                  style={{ animationDuration: '3s' }}
                />
              </div>
            </div>
          </div>

          <p className="text-lg font-semibold text-gray-800 mb-2 transition-opacity duration-500">
            {statusMessages[statusMessageIndex]}
          </p>

          {/* Shimmer bar */}
          <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#5F35D2]/40 via-[#5F35D2] to-[#5F35D2]/40 rounded-full"
              style={{
                animation: 'shimmer 1.5s ease-in-out infinite',
                width: '40%',
              }}
            />
          </div>

          <p className="text-sm text-gray-500">
            Processing {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}
          </p>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(350%);
            }
          }
        `}</style>
      </div>
    );
  }

  // ── Confirm Phase ───────────────────────────────────────────────────
  if (phase === 'confirm') {
    return (
      <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
        <WizardHeader currentStep={2} />

        {/* White card with confirm content */}
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center gap-3 p-6 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#5F35D2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Confirm Sync Items Details</h2>
              <p className="text-sm text-gray-500">
                Review the predicted inventory details before syncing
              </p>
            </div>
          </div>

          {/* Body — scrollable table */}
          <div className="flex-1 overflow-auto p-6">
            {predictedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-semibold text-gray-600">No predicted items returned</p>
                <p className="text-sm mt-1 text-gray-400">
                  Please try again or select different items
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#5F35D2]/[0.04] border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        Item Name
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        Item Type
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        Unit
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        Supplier
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        Strictness
                      </th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        Opening Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictedItems.map((item, idx) => (
                      <tr
                        key={item.menuItemId || idx}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-3 px-3 text-gray-800 font-medium whitespace-nowrap">
                          {item.suggestedInventoryItemName}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editableData[idx]?.itemType ?? '0'}
                            onChange={(e) =>
                              handleEditableChange(idx, 'itemType', e.target.value)
                            }
                            className={selectClass}
                          >
                            <option value={InventoryItemType.Direct}>Direct</option>
                            <option value={InventoryItemType.Ingredient}>Ingredient</option>
                            <option value={InventoryItemType.Produced}>Produced</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editableData[idx]?.unitId ?? ''}
                            onChange={(e) =>
                              handleEditableChange(idx, 'unitId', e.target.value)
                            }
                            disabled={unitsLoading}
                            className={selectClass}
                          >
                            <option value="">Select unit</option>
                            {Array.isArray(unitsByBusiness) &&
                              unitsByBusiness.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editableData[idx]?.supplierId ?? ''}
                            onChange={(e) =>
                              handleEditableChange(idx, 'supplierId', e.target.value)
                            }
                            disabled={suppliersLoading}
                            className={selectClass}
                          >
                            <option value="">Select supplier</option>
                            {Array.isArray(suppliers) &&
                              suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editableData[idx]?.strictnessLevel ?? '0'}
                            onChange={(e) =>
                              handleEditableChange(idx, 'strictnessLevel', e.target.value)
                            }
                            className={selectClass}
                          >
                            <option value={0}>Safe</option>
                            <option value={1}>Strict</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editableData[idx]?.openingStock ?? '0'}
                            onChange={(e) =>
                              handleEditableChange(idx, 'openingStock', e.target.value)
                            }
                            className={selectClass}
                          >
                            {[0, 5, 10, 25, 50, 100, 200, 500, 1000].map((v) => (
                              <option key={v} value={String(v)}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex justify-between items-center w-full mt-6">
          <button
            onClick={handleBackToSelect}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <span>&larr;</span>
            <span>Back</span>
          </button>
          <button
            onClick={handleConfirmSync}
            disabled={predictedItems.length === 0 || isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span>Sync Items to Inventory</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// ── Custom Checkbox ───────────────────────────────────────────────────

const Checkbox: React.FC<{ checked: boolean; indeterminate?: boolean }> = ({
  checked,
  indeterminate = false,
}) => {
  return (
    <div
      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
        checked || indeterminate
          ? 'bg-[#5F35D2] border-[#5F35D2]'
          : 'border-gray-300 bg-white'
      }`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {indeterminate && !checked && (
        <div className="w-2.5 h-0.5 bg-white rounded-full" />
      )}
    </div>
  );
};

export default SyncStep;
