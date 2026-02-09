'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Spinner,
} from '@nextui-org/react';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { notify } from '@/lib/utils';
import type { ItemUnit, InventoryUnit } from '@/app/api/controllers/dashboard/inventory';
import {
  createItemUnit,
  updateItemUnit,
  deleteItemUnit,
  CreateItemUnitPayload,
  UpdateItemUnitPayload,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import DeleteModal from '@/components/ui/deleteModal';

interface ItemUnitsTableProps {
  itemUnits: ItemUnit[];
  primaryUnitId: string;
  costPerUnit: number;
  unitsByBusiness: InventoryUnit[];
  inventoryItemId: string;
  onRefetch: () => void;
  onEditPrimaryUnit: () => void;
}

interface EditData {
  isPurchasable: boolean;
  isConsumable: boolean;
  baseUnitEquivalent: string;
}

interface NewUnitData {
  unitId: string;
  isPurchasable: boolean;
  isConsumable: boolean;
  baseUnitEquivalent: string;
}

const ItemUnitsTable: React.FC<ItemUnitsTableProps> = ({
  itemUnits,
  primaryUnitId,
  costPerUnit,
  unitsByBusiness,
  inventoryItemId,
  onRefetch,
  onEditPrimaryUnit,
}) => {
  // Debug logging for data flow troubleshooting
  console.log('ItemUnitsTable props:', {
    itemUnits,
    primaryUnitId,
    unitsByBusiness: unitsByBusiness.length,
    availableUnits: unitsByBusiness.filter(
      (u) => u.id !== primaryUnitId && !itemUnits.some((iu) => iu.unitId === u.id)
    ).length,
  });
  // Editing state
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    isPurchasable: false,
    isConsumable: false,
    baseUnitEquivalent: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add unit state
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitData, setNewUnitData] = useState<NewUnitData>({
    unitId: '',
    isPurchasable: true,
    isConsumable: true,
    baseUnitEquivalent: '',
  });
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<ItemUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle update state (for instant switch saves) - track all updating toggles to prevent race conditions
  const [updatingToggles, setUpdatingToggles] = useState<Set<string>>(new Set());

  const getUnitInfo = (unitId: string) => {
    const unit = unitsByBusiness.find((u) => u.id === unitId);
    return {
      name: unit?.name || '',
      code: unit?.code || '',
    };
  };

  const getPrimaryUnitName = useCallback(() => {
    const unit = unitsByBusiness.find((u) => u.id === primaryUnitId);
    return unit?.name || 'unit';
  }, [unitsByBusiness, primaryUnitId]);

  // Get units that are not already added
  const availableUnits = unitsByBusiness.filter(
    (u) =>
      u.id !== primaryUnitId &&
      !itemUnits.some((iu) => iu.unitId === u.id)
  );

  // Auto-cancel add mode if no units become available
  useEffect(() => {
    if (isAddingUnit && availableUnits.length === 0) {
      setIsAddingUnit(false);
      notify({ title: 'Error!', text: 'No additional units available to add', type: 'error' });
    }
  }, [isAddingUnit, availableUnits.length]);

  const columns = [
    { key: 'unit', label: 'Unit' },
    { key: 'purchase', label: 'Purchase' },
    { key: 'consumption', label: 'Consumption' },
    { key: 'baseEquiv', label: 'Base Equivalent' },
    { key: 'actions', label: 'Actions' },
  ];

  // Handle instant toggle update for purchase/consumption
  const handleToggleUpdate = useCallback(
    async (itemUnit: ItemUnit, field: 'isPurchasable' | 'isConsumable', value: boolean) => {
      const toggleKey = `${itemUnit.id}-${field}`;
      setUpdatingToggles(prev => new Set(prev).add(toggleKey));
      try {
        const business = getJsonItemFromLocalStorage('business');
        const payload: UpdateItemUnitPayload = {
          inventoryItemId: inventoryItemId,
          unitId: itemUnit.unitId,
          unitName: itemUnit.unitName,
          unitCode: itemUnit.unitCode,
          isPurchasable: field === 'isPurchasable' ? value : itemUnit.isPurchasable,
          isConsumable: field === 'isConsumable' ? value : itemUnit.isConsumable,
          baseUnitEquivalent: itemUnit.baseUnitEquivalent,
        };

        const response = await updateItemUnit(
          business[0]?.businessId,
          itemUnit.id,
          payload
        );

        if (response?.data?.isSuccessful) {
          onRefetch();
        } else {
          notify({ title: 'Error!', text: response?.data?.error || 'Failed to update', type: 'error' });
        }
      } catch (error) {
        console.error('Error updating unit:', error);
        notify({ title: 'Error!', text: 'Failed to update', type: 'error' });
      } finally {
        setUpdatingToggles(prev => {
          const next = new Set(prev);
          next.delete(toggleKey);
          return next;
        });
      }
    },
    [inventoryItemId, onRefetch]
  );

  // Start editing a unit
  const handleStartEdit = useCallback((itemUnit: ItemUnit) => {
    setEditingUnitId(itemUnit.id);
    setEditData({
      isPurchasable: itemUnit.isPurchasable,
      isConsumable: itemUnit.isConsumable,
      baseUnitEquivalent: String(itemUnit.baseUnitEquivalent),
    });
  }, []);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingUnitId(null);
    setEditData({
      isPurchasable: false,
      isConsumable: false,
      baseUnitEquivalent: '',
    });
  }, []);

  // Save edit
  const handleSaveEdit = useCallback(
    async (itemUnit: ItemUnit) => {
      const baseEquiv = parseFloat(editData.baseUnitEquivalent);
      if (isNaN(baseEquiv) || baseEquiv <= 0) {
        notify({ title: 'Error!', text: 'Base equivalent must be a positive number', type: 'error' });
        return;
      }

      setIsSavingEdit(true);
      try {
        const business = getJsonItemFromLocalStorage('business');
        const payload: UpdateItemUnitPayload = {
          inventoryItemId: inventoryItemId,
          unitId: itemUnit.unitId,
          unitName: itemUnit.unitName,
          unitCode: itemUnit.unitCode,
          isPurchasable: editData.isPurchasable,
          isConsumable: editData.isConsumable,
          baseUnitEquivalent: baseEquiv,
        };

        const response = await updateItemUnit(
          business[0]?.businessId,
          itemUnit.id,
          payload
        );

        if (response?.data?.isSuccessful) {
          notify({ title: 'Success!', text: 'Unit updated successfully', type: 'success' });
          setEditingUnitId(null);
          onRefetch();
        } else {
          notify({ title: 'Error!', text: response?.data?.error || 'Failed to update unit', type: 'error' });
        }
      } catch (error) {
        console.error('Error updating unit:', error);
        notify({ title: 'Error!', text: 'Failed to update unit', type: 'error' });
      } finally {
        setIsSavingEdit(false);
      }
    },
    [editData, inventoryItemId, onRefetch]
  );

  // Delete unit
  const handleDeleteClick = useCallback((itemUnit: ItemUnit) => {
    setUnitToDelete(itemUnit);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!unitToDelete) return;

    setIsDeleting(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await deleteItemUnit(
        business[0]?.businessId,
        unitToDelete.id
      );

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Unit deleted successfully', type: 'success' });
        setDeleteModalOpen(false);
        setUnitToDelete(null);
        onRefetch();
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to delete unit', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      notify({ title: 'Error!', text: 'Failed to delete unit', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [unitToDelete, onRefetch]);

  // Add new unit
  const handleStartAddUnit = useCallback(() => {
    setIsAddingUnit(true);
    setNewUnitData({
      unitId: '',
      isPurchasable: true,
      isConsumable: true,
      baseUnitEquivalent: '',
    });
  }, []);

  const handleCancelAddUnit = useCallback(() => {
    setIsAddingUnit(false);
    setNewUnitData({
      unitId: '',
      isPurchasable: true,
      isConsumable: true,
      baseUnitEquivalent: '',
    });
  }, []);

  const handleSaveNewUnit = useCallback(async () => {
    if (!newUnitData.unitId) {
      notify({ title: 'Error!', text: 'Please select a unit', type: 'error' });
      return;
    }

    const baseEquiv = parseFloat(newUnitData.baseUnitEquivalent);
    if (isNaN(baseEquiv) || baseEquiv <= 0) {
      notify({ title: 'Error!', text: 'Base equivalent must be a positive number', type: 'error' });
      return;
    }

    const selectedUnit = unitsByBusiness.find((u) => u.id === newUnitData.unitId);
    if (!selectedUnit) {
      notify({ title: 'Error!', text: 'Invalid unit selected', type: 'error' });
      return;
    }

    setIsSavingNew(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      // Use abbreviation if available, otherwise fallback to unit name or extract from ID
      const unitCode = selectedUnit.code ||
        (selectedUnit.id.startsWith('UNIT_') ? selectedUnit.id.replace('UNIT_', '') : selectedUnit.name.substring(0, 3).toUpperCase());
      const payload: CreateItemUnitPayload = {
        inventoryItemId,
        unitId: newUnitData.unitId,
        unitName: selectedUnit.name,
        unitCode,
        isPurchasable: newUnitData.isPurchasable,
        isConsumable: newUnitData.isConsumable,
        baseUnitEquivalent: baseEquiv,
      };

      const response = await createItemUnit(business[0]?.businessId, payload);

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Unit added successfully', type: 'success' });
        setIsAddingUnit(false);
        setNewUnitData({
          unitId: '',
          isPurchasable: true,
          isConsumable: true,
          baseUnitEquivalent: '',
        });
        onRefetch();
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to add unit', type: 'error' });
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      notify({ title: 'Error!', text: 'Failed to add unit', type: 'error' });
    } finally {
      setIsSavingNew(false);
    }
  }, [newUnitData, unitsByBusiness, inventoryItemId, onRefetch]);

  // Build rows
  const rows = React.useMemo(() => {
    const primaryUnit = getUnitInfo(primaryUnitId);
    const allRows: {
      id: string;
      isPrimary: boolean;
      isNewRow?: boolean;
      unitId: string;
      unitName: string;
      unitCode: string;
      isPurchasable: boolean;
      isConsumable: boolean;
      baseUnitEquivalent: number;
      originalUnit?: ItemUnit;
    }[] = [];

    // Add primary unit as first row
    allRows.push({
      id: 'primary',
      isPrimary: true,
      unitId: primaryUnitId,
      unitName: primaryUnit.name,
      unitCode: primaryUnit.code,
      isPurchasable: true,
      isConsumable: true,
      baseUnitEquivalent: 1,
    });

    // Add item units
    itemUnits.forEach((itemUnit) => {
      const unitInfo = getUnitInfo(itemUnit.unitId);
      allRows.push({
        id: itemUnit.id || itemUnit.unitId,
        isPrimary: false,
        unitId: itemUnit.unitId,
        unitName: itemUnit.unitName || unitInfo.name,
        unitCode: itemUnit.unitCode || unitInfo.code,
        isPurchasable: itemUnit.isPurchasable,
        isConsumable: itemUnit.isConsumable,
        baseUnitEquivalent: itemUnit.baseUnitEquivalent,
        originalUnit: itemUnit,
      });
    });

    return allRows;
  }, [itemUnits, primaryUnitId, unitsByBusiness]);

  // Combined rows including the "add new" row when active
  const displayRows = React.useMemo(() => {
    if (!isAddingUnit) return rows;
    const selectedUnit = unitsByBusiness.find((u) => u.id === newUnitData.unitId);
    return [
      ...rows,
      {
        id: 'new-unit',
        isPrimary: false,
        isNewRow: true,
        unitId: newUnitData.unitId,
        unitName: selectedUnit?.name || '',
        unitCode: selectedUnit?.code || '',
        isPurchasable: newUnitData.isPurchasable,
        isConsumable: newUnitData.isConsumable,
        baseUnitEquivalent: parseFloat(newUnitData.baseUnitEquivalent) || 0,
      },
    ];
  }, [rows, isAddingUnit, newUnitData, unitsByBusiness]);

  const renderCell = (
    row: (typeof displayRows)[0],
    columnKey: string
  ): React.ReactNode => {
    const isEditing = editingUnitId === row.id;
    const isNewRow = row.isNewRow === true;

    switch (columnKey) {
      case 'unit':
        if (isNewRow) {
          if (availableUnits.length === 0) {
            return (
              <div className="text-sm text-amber-600 py-2">
                No units available. Create more units in Settings → Units.
              </div>
            );
          }
          return (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <select
                value={newUnitData.unitId}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewUnitData((prev) => ({ ...prev, unitId: e.target.value }));
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] bg-white appearance-none cursor-pointer"
              >
                <option value="">Select unit</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
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
          );
        }
        return (
          <div className="font-semibold text-sm text-gray-800">
            {row.unitName}
            {row.unitCode && (
              <span className="text-gray-500 font-normal ml-1">
                ({row.unitCode})
              </span>
            )}
          </div>
        );

      case 'purchase':
        if (row.isPrimary) {
          return (
            <Switch
              isSelected={true}
              isDisabled
              size="sm"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          );
        }
        if (isNewRow) {
          return (
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <Switch
                isSelected={newUnitData.isPurchasable}
                onValueChange={(value) =>
                  setNewUnitData((prev) => ({ ...prev, isPurchasable: value }))
                }
                size="sm"
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-green-500',
                }}
              />
            </div>
          );
        }
        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <Switch
                isSelected={editData.isPurchasable}
                onValueChange={(value) =>
                  setEditData((prev) => ({ ...prev, isPurchasable: value }))
                }
                size="sm"
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-green-500',
                }}
              />
            </div>
          );
        }
        return (
          <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Switch
              isSelected={row.isPurchasable}
              onValueChange={(value) =>
                row.originalUnit && handleToggleUpdate(row.originalUnit, 'isPurchasable', value)
              }
              isDisabled={updatingToggles.has(`${row.id}-isPurchasable`) || updatingToggles.has(`${row.id}-isConsumable`)}
              size="sm"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          </div>
        );

      case 'consumption':
        if (row.isPrimary) {
          return (
            <Switch
              isSelected={true}
              isDisabled
              size="sm"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          );
        }
        if (isNewRow) {
          return (
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <Switch
                isSelected={newUnitData.isConsumable}
                onValueChange={(value) =>
                  setNewUnitData((prev) => ({ ...prev, isConsumable: value }))
                }
                size="sm"
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-green-500',
                }}
              />
            </div>
          );
        }
        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <Switch
                isSelected={editData.isConsumable}
                onValueChange={(value) =>
                  setEditData((prev) => ({ ...prev, isConsumable: value }))
                }
                size="sm"
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-green-500',
                }}
              />
            </div>
          );
        }
        return (
          <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Switch
              isSelected={row.isConsumable}
              onValueChange={(value) =>
                row.originalUnit && handleToggleUpdate(row.originalUnit, 'isConsumable', value)
              }
              isDisabled={updatingToggles.has(`${row.id}-isPurchasable`) || updatingToggles.has(`${row.id}-isConsumable`)}
              size="sm"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          </div>
        );

      case 'baseEquiv':
        if (row.isPrimary) {
          return (
            <div className="text-sm text-gray-600">
              1 {getPrimaryUnitName().toLowerCase()}
            </div>
          );
        }
        if (isNewRow) {
          return (
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={newUnitData.baseUnitEquivalent}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewUnitData((prev) => ({ ...prev, baseUnitEquivalent: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="0"
                min="0"
                step="0.001"
                className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
              />
            </div>
          );
        }
        if (isEditing) {
          return (
            <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={editData.baseUnitEquivalent}
                onChange={(e) => {
                  e.stopPropagation();
                  setEditData((prev) => ({ ...prev, baseUnitEquivalent: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="0"
                min="0"
                step="0.001"
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
              />
            </div>
          );
        }
        return (
          <div className="text-sm text-gray-600">
            {row.baseUnitEquivalent} {getPrimaryUnitName().toLowerCase()}
          </div>
        );

      case 'actions':
        if (row.isPrimary) {
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPrimaryUnit();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notify({ title: 'Error!', text: 'Primary unit cannot be deleted', type: 'error' });
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }
        if (isNewRow) {
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveNewUnit();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isSavingNew || !newUnitData.unitId || availableUnits.length === 0}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Save"
              >
                {isSavingNew ? (
                  <Spinner size="sm" color="success" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelAddUnit();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isSavingNew}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }
        if (isEditing) {
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  row.originalUnit && handleSaveEdit(row.originalUnit);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isSavingEdit}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Save"
              >
                {isSavingEdit ? (
                  <Spinner size="sm" color="success" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isSavingEdit}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                row.originalUnit && handleStartEdit(row.originalUnit);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                row.originalUnit && handleDeleteClick(row.originalUnit);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Unit Conversions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage measurement units for this item
          </p>
        </div>
        <button
          onClick={handleStartAddUnit}
          disabled={isAddingUnit || availableUnits.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      <Table
        aria-label="Unit conversions table"
        removeWrapper
        selectionMode="none"
        disabledBehavior="all"
        classNames={{
          th: 'bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider',
          td: 'py-3',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === 'actions' ? 'center' : 'start'}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="No units configured" items={displayRows}>
          {(row) => (
            <TableRow key={row.id}>
              {(columnKey) => (
                <TableCell>{renderCell(row, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        toggleModal={() => {
          setDeleteModalOpen(false);
          setUnitToDelete(null);
        }}
        handleDelete={handleConfirmDelete}
        isLoading={isDeleting}
        text="Are you sure you want to delete this unit conversion?"
      />
    </>
  );
};

export default ItemUnitsTable;
