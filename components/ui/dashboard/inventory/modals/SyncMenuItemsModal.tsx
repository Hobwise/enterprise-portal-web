'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { X, ChevronDown, RefreshCw, Sparkles } from 'lucide-react';
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
import { toast } from 'sonner';
import { useSuppliers, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';

type ModalStep = 'select' | 'processing' | 'confirm';

type EditableItemData = {
  costPerUnit: string;
  salesPrice: string;
  itemType: string;
  unitId: string;
  supplierId: string;
  strictnessLevel: string;
  openingStock: string;
};

interface SyncMenuItemsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  data: MenuSummaryCategory[];
  isLoading: boolean;
  onSync: () => void;
}

const SyncMenuItemsModal: React.FC<SyncMenuItemsModalProps> = ({
  isOpen,
  onOpenChange,
  data,
  isLoading,
  onSync,
}) => {
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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems(new Set());
      setExpandedCategories(new Set());
      setStep('select');
      setPredictedItems([]);
      setEditableData([]);
      setStatusMessageIndex(0);
      abortRef.current = true;
    } else {
      abortRef.current = false;
    }
  }, [isOpen]);

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

    const runPredict = async () => {
      try {
        const business = getJsonItemFromLocalStorage('business');
        const businessId = business?.[0]?.businessId;

        // Build payload from selected items
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
        notify({
          title: 'Error',
          text: 'Failed to analyze menu items. Please try again.',
          type: 'error',
        });
        setStep('select');
      }
    };

    runPredict();
  }, [step, data, selectedItems]);

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

      if (response?.data?.isSuccessful) {
        toast.success('Items synced to inventory successfully');
        onSync();
      } else {
        toast.error(response?.data?.error || 'Failed to sync items to inventory');
      }
    } catch (error) {
      toast.error('Failed to sync items to inventory. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [onSync, selectedItems, predictedItems, editableData]);

  const handleBackToSelect = useCallback(() => {
    setStep('select');
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      size={step === 'confirm' ? '5xl' : 'lg'}
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full max-h-[85vh] flex flex-col">
              {step === 'select' && (
                <SelectStep
                  data={data}
                  isLoading={isLoading}
                  selectedItems={selectedItems}
                  expandedCategories={expandedCategories}
                  allSelected={allSelected}
                  totalItems={totalItems}
                  onClose={() => onOpenChange(false)}
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
                  onClose={() => onOpenChange(false)}
                />
              )}

              {step === 'confirm' && (
                <ConfirmStep
                  predictedItems={predictedItems}
                  editableData={editableData}
                  onEditableChange={setEditableData}
                  onBack={handleBackToSelect}
                  onSync={handleConfirmSync}
                  onClose={() => onOpenChange(false)}
                  isSyncing={isSyncing}
                />
              )}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

// ── Step 1: Select Items ──────────────────────────────────────────────

interface SelectStepProps {
  data: MenuSummaryCategory[];
  isLoading: boolean;
  selectedItems: Set<string>;
  expandedCategories: Set<string>;
  allSelected: boolean;
  totalItems: number;
  onClose: () => void;
  toggleSelectAll: () => void;
  toggleCategory: (menuId: string) => void;
  toggleCategorySelection: (category: MenuSummaryCategory) => void;
  toggleItem: (itemId: string) => void;
  getCategoryState: (category: MenuSummaryCategory) => string;
  onSync: () => void;
}

const SelectStep: React.FC<SelectStepProps> = ({
  data,
  isLoading,
  selectedItems,
  expandedCategories,
  allSelected,
  totalItems,
  onClose,
  toggleSelectAll,
  toggleCategory,
  toggleCategorySelection,
  toggleItem,
  getCategoryState,
  onSync,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#5F35D2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sync Menu Items</h2>
            <p className="text-sm text-gray-500">
              Swiftly synchronize menu items to your inventory with ease in group or singles
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#5F35D2]/20 border-t-[#5F35D2] rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600">No menu items to sync</p>
            <p className="text-sm mt-1 text-gray-400">All menu items are already synced to inventory</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 mb-3">Select category or item</p>

            {/* Select All Row */}
            <div
              className="flex items-center gap-3 p-3 border border-gray-200 border-l-3 border-l-[#5F35D2] rounded-xl cursor-pointer bg-[#5F35D2]/[0.03] hover:bg-[#5F35D2]/[0.06] transition-colors"
              onClick={toggleSelectAll}
            >
              <Checkbox checked={allSelected} indeterminate={!allSelected && selectedItems.size > 0} />
              <span className="text-sm font-semibold text-gray-800 flex-1">Select all synced</span>
              <span className="text-xs bg-[#5F35D2]/10 text-[#5F35D2] px-2 py-1 rounded-full font-medium">
                {totalItems}
              </span>
            </div>

            {/* Category Rows */}
            {data.map((category) => {
              const isExpanded = expandedCategories.has(category.menuId);
              const categoryState = getCategoryState(category);
              const hasSelection = categoryState !== 'none';

              return (
                <div
                  key={category.menuId}
                  className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-sm ${
                    hasSelection ? 'border-l-2 border-l-[#5F35D2]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div onClick={(e) => { e.stopPropagation(); toggleCategorySelection(category); }}>
                      <Checkbox checked={categoryState === 'all'} indeterminate={categoryState === 'some'} />
                    </div>
                    <div className="flex items-center gap-3 flex-1" onClick={() => toggleCategory(category.menuId)}>
                      <span className="text-sm font-medium text-gray-700 flex-1">{category.menuName}</span>
                      <span className="text-xs bg-[#5F35D2]/10 text-[#5F35D2] px-2 py-1 rounded-full font-medium">
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
                    <div className="border-t border-gray-100 bg-gray-50/50 border-l-2 border-l-[#5F35D2]/20 ml-3">
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

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
        <button
          onClick={onSync}
          disabled={selectedItems.size === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span>
            {selectedItems.size > 0
              ? `Sync ${selectedItems.size} Item${selectedItems.size !== 1 ? 's' : ''} to Inventory`
              : 'Sync Items to Inventory'}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </>
  );
};

// ── Step 2: AI Processing Animation ───────────────────────────────────

interface ProcessingStepProps {
  itemCount: number;
  statusMessage: string;
  onClose: () => void;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ itemCount, statusMessage, onClose }) => {
  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-end p-6 pb-2">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mb-8">
          {/* Outer ping ring */}
          <div className="absolute inset-0 rounded-full bg-[#5F35D2]/20 animate-ping" />
          {/* Middle pulse ring */}
          <div className="absolute inset-1 rounded-full bg-[#5F35D2]/10 animate-pulse" />
          {/* Inner icon circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#5F35D2]/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#5F35D2] animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Status message with fade transition */}
        <p className="text-lg font-semibold text-gray-800 mb-2 transition-opacity duration-500">
          {statusMessage}
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

        {/* Item count */}
        <p className="text-sm text-gray-500">
          Processing {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* CSS for shimmer animation */}
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
    </>
  );
};

// ── Step 3: Confirm Results ───────────────────────────────────────────

interface ConfirmStepProps {
  predictedItems: PredictedInventoryItem[];
  editableData: EditableItemData[];
  onEditableChange: React.Dispatch<React.SetStateAction<EditableItemData[]>>;
  onBack: () => void;
  onSync: () => void;
  onClose: () => void;
  isSyncing?: boolean;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({
  predictedItems,
  editableData,
  onEditableChange,
  onBack,
  onSync,
  onClose,
  isSyncing = false,
}) => {
  const { data: unitsByBusiness, isLoading: unitsLoading } = useUnitsByBusiness();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();

  const handleInputChange = (idx: number, field: keyof EditableItemData, value: string) => {
    onEditableChange((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const selectClass = "w-full px-2 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5F35D2] focus:border-[#5F35D2] bg-white appearance-none";

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
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
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Body — scrollable table */}
      <div className="flex-1 overflow-auto p-6">
        {predictedItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="font-semibold text-gray-600">No predicted items returned</p>
            <p className="text-sm mt-1 text-gray-400">Please try again or select different items</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#5F35D2]/[0.04] border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">Item Name</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">Item Type</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">Unit</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">Supplier</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">Strictness</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">Opening Stock</th>
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
                        onChange={(e) => handleInputChange(idx, 'itemType', e.target.value)}
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
                        onChange={(e) => handleInputChange(idx, 'unitId', e.target.value)}
                        disabled={unitsLoading}
                        className={selectClass}
                      >
                        <option value="">Select unit</option>
                        {Array.isArray(unitsByBusiness) && unitsByBusiness.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={editableData[idx]?.supplierId ?? ''}
                        onChange={(e) => handleInputChange(idx, 'supplierId', e.target.value)}
                        disabled={suppliersLoading}
                        className={selectClass}
                      >
                        <option value="">Select supplier</option>
                        {Array.isArray(suppliers) && suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={editableData[idx]?.strictnessLevel ?? '0'}
                        onChange={(e) => handleInputChange(idx, 'strictnessLevel', e.target.value)}
                        className={selectClass}
                      >
                        <option value={0}>Safe</option>
                        <option value={1}>Strict</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={editableData[idx]?.openingStock ?? '0'}
                        onChange={(e) => handleInputChange(idx, 'openingStock', e.target.value)}
                        className={selectClass}
                      >
                        {[0, 5, 10, 25, 50, 100, 200, 500, 1000].map((v) => (
                          <option key={v} value={String(v)}>{v}</option>
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

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
        <button
          onClick={onSync}
          disabled={predictedItems.length === 0 || isSyncing}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isSyncing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <span>Sync Items to Inventory</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </>
  );
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

export default SyncMenuItemsModal;
