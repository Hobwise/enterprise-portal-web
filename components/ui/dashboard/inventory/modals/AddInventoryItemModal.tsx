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
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allowTracking, setAllowTracking] = useState(true);
  const [unitId, setUnitId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks
  const { data: suppliers, isLoading: suppliersLoading, refetch: refetchSuppliers } = useSuppliers();
  const { data: unitsByBusiness, isLoading: unitsByBusinessLoading } = useUnitsByBusiness();

  // Refetch suppliers when modal opens to pick up newly created ones
  useEffect(() => {
    if (isOpen) {
      refetchSuppliers();
    }
  }, [isOpen]);

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
    setExpiryDate('');
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
if (!averageCostPerBaseUnit || parseFloat(averageCostPerBaseUnit) <= 0) {
      notify({ title: 'Error!', text: 'Average cost per base unit is required', type: 'error' });
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
        averageCostPerUnit: parseFloat(averageCostPerBaseUnit),
        isActive,
        allowTracking,
        unitId,
        ...(supplierId ? { supplierId } : {}),
        ...(expiryDate ? { expiryDate: new Date(expiryDate).toISOString() } : {}),
      };

      const response = await createInventoryItem(business[0]?.businessId, payload);

      if (!response) return;

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response?.data?.isSuccessful) {
        const newItemId = response.data.data?.id;
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
          onOpenChange(false);
          onSuccess();
        }
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to register item', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200';
  const labelClass = 'block text-xs font-semibold text-gray-700 mb-1';
  const selectClass = `${inputClass} appearance-none pr-9`;

  const renderCreateItemStep = () => (
    <div className="p-5 space-y-4">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Item Name */}
        <div>
          <label className={labelClass}>Item Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter item name"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Unit</label>
          <div className="relative">
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={unitsByBusinessLoading}
              className={selectClass}
            >
              <option value="">Select unit</option>
              {Array.isArray(unitsByBusiness) && [...unitsByBusiness].filter((u) => u.isActive).sort((a, b) => a.name.localeCompare(b.name)).map((u) => (
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
                  className="w-4 h-4 text-gray-400"
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
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter item description"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Average Cost Per Base Unit */}
        <div>
          <label className={labelClass}>
            Avg Cost / Base Unit
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold text-sm">
              &#x20A6;
            </span>
            <input
              type="number"
              value={averageCostPerBaseUnit}
              onChange={(e) => setAverageCostPerBaseUnit(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>

        {/* Reorder Threshold */}
        <div>
          <label className={labelClass}>Reorder Threshold</label>
          <input
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className={inputClass}
          />
        </div>

        {/* Opening Stock */}
        <div>
          <label className={labelClass}>Opening Stock</label>
          <input
            type="number"
            value={openingStock}
            onChange={(e) => setOpeningStock(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className={inputClass}
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className={labelClass}>
            Expiry Date
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={inputClass}
          />
        </div>
      </div>

      {/* Classification */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Supplier Name */}
        <div>
          <label className={labelClass}>Supplier Name</label>
          <div className="relative">
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={suppliersLoading}
              className={selectClass}
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
                  className="w-4 h-4 text-gray-400"
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
          <label className={labelClass}>Item Type</label>
          <div className="relative">
            <select
              value={itemType === null ? '' : itemType}
              onChange={(e) => {
                const val = e.target.value;
                setItemType(val === '' ? null : Number(val) as InventoryItemType);
              }}
              className={selectClass}
            >
              <option value="">Select item type</option>
              <option value={InventoryItemType.Direct}>Direct</option>
              <option value={InventoryItemType.Ingredient}>Ingredient</option>
              <option value={InventoryItemType.Produced}>Produced</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
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

      {/* Settings Section */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Inventory Settings
        </h3>

        {/* Active + Allow Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-gray-500">
                Enable or disable this item
              </p>
            </div>
            <Switch
              size="sm"
              isSelected={isActive}
              onValueChange={setIsActive}
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Allow Tracking</p>
              <p className="text-xs text-gray-500">
                Track stock and movements
              </p>
            </div>
            <Switch
              size="sm"
              isSelected={allowTracking}
              onValueChange={setAllowTracking}
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          </div>
        </div>

        {/* Strictness Level */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Strictness Level
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="strictnessLevel"
                value={0}
                checked={strictnessLevel === 0}
                onChange={() => setStrictnessLevel(0)}
                className="mt-0.5 w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Safe Mode</p>
                <p className="text-xs text-gray-500">
                  Never block sales. Allow negative stock.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="strictnessLevel"
                value={1}
                checked={strictnessLevel === 1}
                onChange={() => setStrictnessLevel(1)}
                className="mt-0.5 w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Strict Mode</p>
                <p className="text-xs text-gray-500">
                  Prevent selling out-of-stock items.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSubmitItem}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5F35D2] text-white rounded-lg hover:bg-[#5F35D2]/90 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                className="w-4 h-4"
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
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      Add Inventory Item
                    </h2>
                    <p className="text-xs text-gray-500">
                      Register a new item to your inventory
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
