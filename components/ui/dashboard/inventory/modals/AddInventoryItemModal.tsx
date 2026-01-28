'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, Plus, Package, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  createInventoryItem,
  createItemUnit,
  CreateInventoryPayload,
  CreateItemUnitPayload,
  InventoryItemType,
} from '@/app/api/controllers/dashboard/inventory';
import { useSuppliers, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';

type ModalStep = 'create-item' | 'add-units';

type AddedUnit = {
  unitId: string;
  unitName: string;
  isPurchasable: boolean;
  isConsumable: boolean;
  baseUnitEquivalent: number;
};

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  onOpenRecipeModal?: (producedItemId: string) => void;
}

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  onOpenRecipeModal,
}) => {
  // Step state
  const [step, setStep] = useState<ModalStep>('create-item');
  const [createdItemId, setCreatedItemId] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<InventoryItemType | null>(null);
  const [strictnessLevel, setStrictnessLevel] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState('');
  const [reorderQuantity, setReorderQuantity] = useState('');
  const [averageCostPerBaseUnit, setAverageCostPerBaseUnit] = useState('');
  const [isActive, setIsActive] = useState(true);
const [unitId, setUnitId] = useState('');
const [supplierId, setSupplierId] = useState('');
  const [loading, setLoading] = useState(false);

  // Item units state (step 2)
  const [addedUnits, setAddedUnits] = useState<AddedUnit[]>([]);
  const [newUnitId, setNewUnitId] = useState('');
  const [newIsPurchasable, setNewIsPurchasable] = useState(false);
  const [newIsConsumable, setNewIsConsumable] = useState(false);
  const [newBaseUnitEquivalent, setNewBaseUnitEquivalent] = useState('');
  const [addingUnit, setAddingUnit] = useState(false);

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
    setStep('create-item');
    setCreatedItemId('');
    setName('');
    setDescription('');
    setItemType(null);
    setStrictnessLevel(0);
    setReorderLevel('');
    setReorderQuantity('');
    setAverageCostPerBaseUnit('');
    setIsActive(true);
    setUnitId('');
    setSupplierId('');
    setAddedUnits([]);
    setNewUnitId('');
    setNewIsPurchasable(false);
    setNewIsConsumable(false);
    setNewBaseUnitEquivalent('');
  };

  const handleSubmitItem = async () => {
    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }
if (!unitId) {
      toast.error('Please select a unit');
      return;
    }
if (!averageCostPerBaseUnit || parseFloat(averageCostPerBaseUnit) < 0) {
      toast.error('Please enter a valid average cost per base unit');
      return;
    }
    if (itemType === null) {
      toast.error('Please select an item type');
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
        reorderLevel: reorderLevel ? parseFloat(reorderLevel) : 0,
        reorderQuantity: reorderQuantity ? parseFloat(reorderQuantity) : 0,
        averageCostPerBaseUnit: parseFloat(averageCostPerBaseUnit),
        isActive,
        unitId,
        ...(supplierId ? { supplierId } : {}),
      };

      const response = await createInventoryItem(business[0]?.businessId, payload);

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        toast.error(errorMessage || 'Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        const newItemId = response.data.data?.id;
        toast.success('Item registered successfully');

        if (itemType === InventoryItemType.Produced) {
          onOpenChange(false);
          onSuccess();
          if (onOpenRecipeModal && newItemId) {
            onOpenRecipeModal(newItemId);
          }
        } else {
          // Direct or Ingredient -> go to add-units step
          setCreatedItemId(newItemId);
          setStep('add-units');
        }
      } else {
        toast.error(response?.data?.error || 'Failed to register item');
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      toast.error('Failed to register item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitId) {
      toast.error('Please select a unit');
      return;
    }
    if (!newBaseUnitEquivalent || parseFloat(newBaseUnitEquivalent) < 0) {
      toast.error('Please enter a valid base unit equivalent');
      return;
    }

    setAddingUnit(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateItemUnitPayload = {
        inventoryItemId: createdItemId,
        unitId: newUnitId,
        isPurchasable: newIsPurchasable,
        isConsumable: newIsConsumable,
        baseUnitEquivalent: parseFloat(newBaseUnitEquivalent),
      };

      const response = await createItemUnit(business[0]?.businessId, payload);

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        toast.error(errorMessage || 'Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        const unit = unitsByBusiness.find((u) => u.id === newUnitId);
        setAddedUnits([
          ...addedUnits,
          {
            unitId: newUnitId,
            unitName: unit?.name || '',
            isPurchasable: newIsPurchasable,
            isConsumable: newIsConsumable,
            baseUnitEquivalent: parseFloat(newBaseUnitEquivalent),
          },
        ]);
        setNewUnitId('');
        setNewIsPurchasable(false);
        setNewIsConsumable(false);
        setNewBaseUnitEquivalent('');
        toast.success('Unit added successfully');
      } else {
        toast.error(response?.data?.error || 'Failed to add unit');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Failed to add unit');
    } finally {
      setAddingUnit(false);
    }
  };

  const handleDone = () => {
    onOpenChange(false);
    onSuccess();
  };

  const renderCreateItemStep = () => (
    <div className="p-6 space-y-6">
      {/* Basic Info */}
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
              {unitsByBusiness.map((u) => (
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

        {/* Reorder Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reorder Quantity
          </label>
          <input
            type="number"
            value={reorderQuantity}
            onChange={(e) => setReorderQuantity(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
          />
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Supplier Name
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <div className="relative">
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={suppliersLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
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

        {/* Unit */}
       
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

  const renderAddUnitsStep = () => (
    <div className="p-6 space-y-6">
      {/* Added units table */}
      {addedUnits.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Unit</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Purchasable</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Consumable</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Base Unit Eq.</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {addedUnits.map((u, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-700">{u.unitName}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.isPurchasable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isPurchasable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.isConsumable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isConsumable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">{u.baseUnitEquivalent}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => setAddedUnits(addedUnits.filter((_, i) => i !== idx))}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add unit input row */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unit select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit
            </label>
            <div className="relative">
              <select
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                disabled={unitsByBusinessLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 appearance-none"
              >
                <option value="">Select unit</option>
                {unitsByBusiness.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
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

          {/* Base Unit Equivalent */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Base Unit Equivalent
            </label>
            <input
              type="number"
              value={newBaseUnitEquivalent}
              onChange={(e) => setNewBaseUnitEquivalent(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              isSelected={newIsPurchasable}
              onValueChange={setNewIsPurchasable}
              size="sm"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
              }}
            />
            <span className="text-sm text-gray-700">Purchasable</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={newIsConsumable}
              onValueChange={setNewIsConsumable}
              size="sm"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
              }}
            />
            <span className="text-sm text-gray-700">Consumable</span>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleAddUnit}
          disabled={addingUnit}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5B5B5B] text-white rounded-xl hover:bg-[#4A4A4A] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addingUnit ? (
            <>
              <Spinner size="sm" color="current" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <span>Add Unit</span>
              <Plus className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Done button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleDone}
          className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>Done</span>
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const headerTitle = step === 'create-item' ? 'Add Inventory Item' : 'Add Item Units';
  const headerSubtitle = step === 'create-item'
    ? 'Register a new item to your inventory'
    : 'Add units for the inventory item';

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
                      {headerTitle}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {headerSubtitle}
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

              {step === 'create-item' ? renderCreateItemStep() : renderAddUnitsStep()}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddInventoryItemModal;
