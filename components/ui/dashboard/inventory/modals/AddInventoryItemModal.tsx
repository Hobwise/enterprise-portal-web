'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, Package } from 'lucide-react';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  createInventoryItem,
  CreateInventoryPayload,
  InventoryItemType,
  PendingRecipeTracking,
} from '@/app/api/controllers/dashboard/inventory';
import { useSuppliers, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  onOpenRecipeModal?: (tracking: PendingRecipeTracking) => void;
}

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  onOpenRecipeModal,
}) => {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<InventoryItemType | null>(null);
  const [strictnessLevel, setStrictnessLevel] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [averageCostPerBaseUnit, setAverageCostPerBaseUnit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allowTracking, setAllowTracking] = useState(true);
  const [unitId, setUnitId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: unitsByBusiness, isLoading: unitsByBusinessLoading } = useUnitsByBusiness();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setItemType(null);
    setStrictnessLevel(0);
    setReorderLevel('');
    setOpeningStock('');
    setAverageCostPerBaseUnit('');
    setIsActive(true);
    setAllowTracking(true);
    setUnitId('');
    setSupplierId('');
  };

  const handleSubmitItem = async () => {
    if (!name.trim()) {
      notify({ title: 'Error!', text: 'Item name is required', type: 'error' });
      return;
    }
if (!unitId) {
      notify({ title: 'Error!', text: 'Please select a unit', type: 'error' });
      return;
    }
if (!averageCostPerBaseUnit || parseFloat(averageCostPerBaseUnit) < 0) {
      notify({ title: 'Error!', text: 'Please enter a valid average cost per base unit', type: 'error' });
      return;
    }
    if (itemType === null) {
      notify({ title: 'Error!', text: 'Please select an item type', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateInventoryPayload = {
        name: name.trim(),
        description: description.trim(),
        itemType,
        strictnessLevel,
        openingStock: openingStock ? parseFloat(openingStock) : 0,
        reorderLevel: reorderLevel ? parseFloat(reorderLevel) : 0,
        reorderQuantity: 0,
        averageCostPerBaseUnit: parseFloat(averageCostPerBaseUnit),
        isActive,
        allowTracking,
        unitId,
        ...(supplierId ? { supplierId } : {}),
      };

      const response = await createInventoryItem(business[0]?.businessId, payload);

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response?.data?.isSuccessful) {
        const newItemId = response.data.data?.id;
        notify({ title: 'Success!', text: 'Item registered successfully', type: 'success' });

        if (itemType === InventoryItemType.Produced) {
          const trackingData: PendingRecipeTracking = {
            trackingId: crypto.randomUUID(),
            inventoryItemId: newItemId,
            itemName: name,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem('pendingRecipeTracking', JSON.stringify(trackingData));
          onOpenChange(false);
          onSuccess();
          if (onOpenRecipeModal) {
            onOpenRecipeModal(trackingData);
          }
        } else {
          // Direct or Ingredient -> redirect to item detail page
          onOpenChange(false);
          onSuccess();
          router.push(`/dashboard/inventory/items/${newItemId}`);
        }
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to register item', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      notify({ title: 'Error!', text: 'Failed to register item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderCreateItemStep = () => (
    <div className="p-6 space-y-6">
      {/* Basic Information */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit
            </label>
            <div className="relative">
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                disabled={unitsByBusinessLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
              >
                <option value="">Select unit</option>
                {Array.isArray(unitsByBusiness) && unitsByBusiness.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {unitsByBusinessLoading ? (
                  <Spinner size="sm" color="secondary" />
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Description - full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Average Cost Per Base Unit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Average Cost Per Base Unit
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold">
                &#x20A6;
              </span>
              <input
                type="number"
                value={averageCostPerBaseUnit}
                onChange={(e) => setAverageCostPerBaseUnit(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>
          </div>

          {/* Reorder Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reorder Level
            </label>
            <input
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
            />
          </div>

          {/* Opening Stock */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Opening Stock
            </label>
            <input
              type="number"
              value={openingStock}
              onChange={(e) => setOpeningStock(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier Name
            </label>
            <div className="relative">
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={suppliersLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
              >
                <option value="">Select supplier</option>
                {Array?.isArray(suppliers) && suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {suppliersLoading ? (
                  <Spinner size="sm" color="secondary" />
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Item Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Type
            </label>
            <div className="relative">
              <select
                value={itemType === null ? '' : itemType}
                onChange={(e) => {
                  const val = e.target.value;
                  setItemType(val === '' ? null : Number(val) as InventoryItemType);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
              >
                <option value="">Select item type</option>
                <option value={InventoryItemType.Direct}>Direct</option>
                <option value={InventoryItemType.Ingredient}>Ingredient</option>
                <option value={InventoryItemType.Produced}>Produced</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Inventory Settings
        </h3>

        {/* Active Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-700">Active</p>
            <p className="text-sm text-gray-500">
              Enable or disable this inventory item
            </p>
          </div>
          <Switch
            isSelected={isActive}
            onValueChange={setIsActive}
            classNames={{
              wrapper: 'group-data-[selected=true]:bg-green-500',
            }}
          />
        </div>

        {/* Allow Tracking Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-700">Allow Tracking</p>
            <p className="text-sm text-gray-500">
              Track stock levels and movements for this item
            </p>
          </div>
          <Switch
            isSelected={allowTracking}
            onValueChange={setAllowTracking}
            classNames={{
              wrapper: 'group-data-[selected=true]:bg-green-500',
            }}
          />
        </div>

        {/* Strictness Level */}
        <div className="space-y-3">
          <p className="font-medium text-gray-700">
            Strictness Level
          </p>

          {/* Safe Mode */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              name="strictnessLevel"
              value={0}
              checked={strictnessLevel === 0}
              onChange={() => setStrictnessLevel(0)}
              className="mt-1 w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
            />
            <div>
              <p className="font-medium text-gray-700">Safe Mode</p>
              <p className="text-sm text-gray-500">
                Never block sales. Allow negative stock. Best for
                first-time users.
              </p>
            </div>
          </label>

          {/* Strict Mode */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              name="strictnessLevel"
              value={1}
              checked={strictnessLevel === 1}
              onChange={() => setStrictnessLevel(1)}
              className="mt-1 w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
            />
            <div>
              <p className="font-medium text-gray-700">Strict Mode</p>
              <p className="text-sm text-gray-500">
                Prevent selling out-of-stock items. Enforce availability
                rules.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSubmitItem}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <Spinner size="sm" color="current" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <span>Register Item</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Add Inventory Item
                    </h2>
                    <p className="text-sm text-gray-500">
                      Register a new item to your inventory
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {renderCreateItemStep()}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddInventoryItemModal;
