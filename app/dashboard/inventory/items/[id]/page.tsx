'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Spinner,
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import {
  ArrowLeft,
  Package,
  BookOpen,
  Save,
  Settings,
  ChevronDown,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import {
  useInventoryItem,
  useUnitsByBusiness,
  useSuppliers,
} from '@/hooks/cachedEndpoints/useInventoryItems';
import {
  InventoryItemType,
  updateInventoryItem,
  CreateInventoryPayload,
  getRecipeByItem,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import ItemUnitsTable from '@/components/ui/dashboard/inventory/ItemUnitsTable';
import AddRecipeModal from '@/components/ui/dashboard/inventory/modals/AddRecipeModal';
import ViewRecipeModal from '@/components/ui/dashboard/inventory/modals/ViewRecipeModal';
import BatchProductionModal from '@/components/ui/dashboard/inventory/modals/BatchProductionModal';
import RecipeRequiredModal from '@/components/ui/dashboard/inventory/modals/RecipeRequiredModal';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';

interface FormData {
  name: string;
  unitId: string;
  description: string;
  costPerUnit: string;
  reorderLevel: string;
  supplierId: string;
  itemType: InventoryItemType | null;
  isActive: boolean;
  strictnessLevel: number;
}

const initialFormData: FormData = {
  name: '',
  unitId: '',
  description: '',
  costPerUnit: '',
  reorderLevel: '',
  supplierId: '',
  itemType: null,
  isActive: true,
  strictnessLevel: 0,
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  // Fetch item data
  const { data: item, isLoading, refetch } = useInventoryItem(itemId);
  const { data: unitsByBusiness, isLoading: unitsLoading } = useUnitsByBusiness();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Modal states
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [isViewRecipeOpen, setIsViewRecipeOpen] = useState(false);
  const [isBatchProductionOpen, setIsBatchProductionOpen] = useState(false);
  const [isRecipeRequiredOpen, setIsRecipeRequiredOpen] = useState(false);

  // Recipe state — checked via getRecipeByItem endpoint
  const [hasRecipe, setHasRecipe] = useState(false);
  const [recipesChecked, setRecipesChecked] = useState(false);

  // Populate form when item loads
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        unitId: item.unitId || '',
        description: item.description || '',
        costPerUnit: String(item.averageCostPerUnit || 0),
        reorderLevel: String(item.reorderLevel || 0),
        supplierId: item.supplierId || '',
        itemType: item.itemType,
        isActive: item.isActive,
        strictnessLevel: item.strictnessLevel,
      });
      setIsFormDirty(false);
    }
  }, [item]);

  // Check recipe existence via getRecipeByItem endpoint
  useEffect(() => {
    if (item && item.itemType === InventoryItemType.Produced) {
      setRecipesChecked(false);
      const business = getJsonItemFromLocalStorage('business');
      getRecipeByItem(business[0]?.businessId, item.id)
        .then((response) => {
          setHasRecipe(!!(response?.data?.isSuccessful && response.data.data));
        })
        .catch(() => {
          setHasRecipe(false);
        })
        .finally(() => {
          setRecipesChecked(true);
        });
    } else if (item) {
      setHasRecipe(false);
      setRecipesChecked(true);
    }
  }, [item]);

  // Auto-open AddRecipeModal for Produced items without a recipe
  useEffect(() => {
    if (
      item &&
      item.itemType === InventoryItemType.Produced &&
      recipesChecked &&
      !hasRecipe
    ) {
      setIsAddRecipeOpen(true);
    }
  }, [item, recipesChecked, hasRecipe]);

  const handleFieldChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsFormDirty(true);
    },
    []
  );

  const handleSaveItem = useCallback(async () => {
    if (!formData.name.trim()) {
      notify({ title: 'Error!', text: 'Item name is required', type: 'error' });
      return;
    }
    if (!formData.unitId) {
      notify({ title: 'Error!', text: 'Please select a unit', type: 'error' });
      return;
    }
    if (!formData.costPerUnit || parseFloat(formData.costPerUnit) < 0) {
      notify({ title: 'Error!', text: 'Please enter a valid cost per unit', type: 'error' });
      return;
    }
    if (formData.itemType === null) {
      notify({ title: 'Error!', text: 'Please select an item type', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateInventoryPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        itemType: formData.itemType,
        strictnessLevel: formData.strictnessLevel,
        reorderLevel: formData.reorderLevel ? parseFloat(formData.reorderLevel) : 0,
        reorderQuantity: 0,
        averageCostPerBaseUnit: parseFloat(formData.costPerUnit),
        isActive: formData.isActive,
        unitId: formData.unitId,
        ...(formData.supplierId ? { supplierId: formData.supplierId } : {}),
      };

      const response = await updateInventoryItem(
        business[0]?.businessId,
        itemId,
        payload
      );

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Item updated successfully', type: 'success' });
        setIsFormDirty(false);
        refetch();
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to update item', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      notify({ title: 'Error!', text: 'Failed to update item', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [formData, itemId, refetch]);

  const handleBack = useCallback(() => {
    router.push('/dashboard/inventory/items');
  }, [router]);

  const handleEditPrimaryUnit = useCallback(() => {
    const unitSelect = document.getElementById('primary-unit-select') as HTMLSelectElement;
    if (unitSelect) {
      unitSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => unitSelect.focus(), 300);
    }
  }, []);

  const getUnitName = useCallback(
    (unitId: string) => {
      const unit = unitsByBusiness.find((u) => u.id === unitId);
      return unit?.name || '';
    },
    [unitsByBusiness]
  );

  if (isLoading || unitsLoading || suppliersLoading) {
    return <CustomLoading />;
  }

  if (!item) {
    return (
      <div className="min-h-screen font-satoshi bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500 text-lg">Item not found</p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#5F35D2] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Items
        </button>
      </div>
    );
  }

  const primaryUnitName = item.unit || getUnitName(item.unitId) || '-';
  const isProducedItem = item.itemType === InventoryItemType.Produced;

  return (
    <div className="min-h-screen font-satoshi ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#5F35D2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Items</span>
        </button>

        {/* Recipe Required Banner for Produced items without a recipe */}
        {isProducedItem && !hasRecipe && recipesChecked && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-800">Recipe Required</p>
                <p className="text-sm text-amber-600">This produced item needs a recipe to enable batch production.</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddRecipeOpen(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
            >
              Add Recipe
            </button>
          </div>
        )}

        {/* Header with Title and Action Buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-[#5F35D2]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Edit Inventory Item
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Update item details and unit conversions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* {isProducedItem && ( */}
                <Dropdown className="text-black">
                  <DropdownTrigger>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-[#5F35D2] text-[#5F35D2] rounded-xl  font-semibold transition-all duration-200">
                      <Settings className="w-4 h-4" />
                      Manage Recipe
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Recipe actions">
                    {/* {!hasRecipe ? ( */}
                      {/* <DropdownItem
                        key="add"
                        startContent={<Plus className="w-4 h-4" />}
                        onPress={() => setIsAddRecipeOpen(true)}
                      >
                        Edit Recipe
                      </DropdownItem> */}
                    {/* // ) : ( */}
                      <>
                        <DropdownItem
                          key="view"
                          startContent={<BookOpen className="w-4 h-4" />}
                          onPress={() => setIsViewRecipeOpen(true)}
                        >
                          View Recipe
                        </DropdownItem>
                        <DropdownItem
                          key="produce"
                          startContent={<Package className="w-4 h-4" />}
                          onPress={() => setIsBatchProductionOpen(true)}
                        >
                          Produce Batch
                        </DropdownItem>
                      </>
                    {/* )} */}
                  </DropdownMenu>
                </Dropdown>
              {/* // )} */}

              <button
                onClick={handleSaveItem}
                disabled={isSaving || !isFormDirty}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" color="current" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Item Details Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Basic Information */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter item name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                />
              </div>

              {/* Primary Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Unit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="primary-unit-select"
                    value={formData.unitId}
                    onChange={(e) => handleFieldChange('unitId', e.target.value)}
                    disabled={unitsLoading}
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
                    {unitsLoading ? (
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
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Enter item description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="border-t border-gray-100 pt-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Per Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost Per Unit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold">
                    &#x20A6;
                  </span>
                  <input
                    type="number"
                    value={formData.costPerUnit}
                    onChange={(e) => handleFieldChange('costPerUnit', e.target.value)}
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
                  value={formData.reorderLevel}
                  onChange={(e) => handleFieldChange('reorderLevel', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                />
              </div>

              {/* Stock Level (disabled) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Level
                </label>
                <input
                  type="number"
                  value={item.stockLevel ?? ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70"
                />
              </div>

              {/* Stock Status (disabled) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Status
                </label>
                <input
                  type="text"
                  value={item.stockStatus ?? ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="border-t border-gray-100 pt-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.supplierId}
                    onChange={(e) => handleFieldChange('supplierId', e.target.value)}
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

              {/* Item Type (disabled) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.itemType === null ? '' : formData.itemType}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleFieldChange(
                        'itemType',
                        val === '' ? null : (Number(val) as InventoryItemType)
                      );
                    }}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70 appearance-none"
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

          {/* Settings Row */}
          <div className="border-t border-gray-100 mt-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-700">Active</p>
                  <p className="text-sm text-gray-500">
                    Enable or disable this inventory item
                  </p>
                </div>
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value) => handleFieldChange('isActive', value)}
                  classNames={{
                    wrapper: 'group-data-[selected=true]:bg-green-500',
                  }}
                />
              </div>

              {/* Strictness Level */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-700 mb-3">Strictness Level</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="strictnessLevel"
                      value={0}
                      checked={formData.strictnessLevel === 0}
                      onChange={() => handleFieldChange('strictnessLevel', 0)}
                      className="w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
                    />
                    <span className="text-sm text-gray-700">Safe Mode</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="strictnessLevel"
                      value={1}
                      checked={formData.strictnessLevel === 1}
                      onChange={() => handleFieldChange('strictnessLevel', 1)}
                      className="w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
                    />
                    <span className="text-sm text-gray-700">Strict Mode</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Conversions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ItemUnitsTable
            itemUnits={item.units || []}
            primaryUnitId={item.unitId}
            costPerUnit={item.averageCostPerUnit}
            unitsByBusiness={unitsByBusiness}
            inventoryItemId={itemId}
            onRefetch={refetch}
            onEditPrimaryUnit={handleEditPrimaryUnit}
          />
        </div>
      </div>

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onOpenChange={setIsAddRecipeOpen}
        onSuccess={() => {
          notify({ title: 'Success!', text: 'Recipe added successfully', type: 'success' });
          setIsAddRecipeOpen(false);
          setRecipesChecked(false);
          refetch();
        }}
        producedInventoryItemID={item.id}
        existingRecipe={undefined}
      />

      {/* View Recipe Modal */}
      <ViewRecipeModal
        isOpen={isViewRecipeOpen}
        onOpenChange={setIsViewRecipeOpen}
        itemId={item.id}
        itemName={item.name}
      />

      {/* Batch Production Modal */}
      <BatchProductionModal
        isOpen={isBatchProductionOpen}
        onOpenChange={setIsBatchProductionOpen}
        onSuccess={() => {
          notify({ title: 'Success!', text: 'Batch production completed successfully', type: 'success' });
          setRecipesChecked(false);
          refetch();
        }}
        item={item}
      />

      {/* Recipe Required Modal */}
      <RecipeRequiredModal
        isOpen={isRecipeRequiredOpen}
        onOpenChange={setIsRecipeRequiredOpen}
        onAddRecipe={() => {
          setIsRecipeRequiredOpen(false);
          setIsAddRecipeOpen(true);
        }}
        itemName={item?.name || ''}
      />
    </div>
  );
}
