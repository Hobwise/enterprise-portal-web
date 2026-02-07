'use client';

import React, { useState } from 'react';
import UnitsList from '@/components/ui/dashboard/inventory/units/UnitsList';
import NoUnits from '@/components/ui/dashboard/inventory/units/NoUnits';
import AddEditUnitModal, {
  UnitFormData,
} from '@/components/ui/dashboard/inventory/units/AddEditUnitModal';
import DeleteUnitModal from '@/components/ui/dashboard/inventory/units/DeleteUnitModal';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';
import useUnitsManagement from '@/hooks/cachedEndpoints/useUnitsManagement';
import type { InventoryUnit } from '@/app/api/controllers/dashboard/inventory';

export default function MeasurementsPage() {
  const {
    data: units,
    isLoading,
    isError,
    refetch,
    createUnit,
    isCreating,
    updateUnit,
    isUpdating,
    deleteUnit,
    isDeleting,
  } = useUnitsManagement();

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<InventoryUnit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<InventoryUnit | null>(null);

  const handleCreateUnit = (formData: UnitFormData) => {
    createUnit(
      {
        name: formData.name,
        code: formData.code,
        category: formData.category,
        isActive: formData.isActive,
      },
      {
        onSuccess: () => {
          setIsAddEditModalOpen(false);
        },
      }
    );
  };

  const handleEditUnit = (formData: UnitFormData) => {
    if (!editingUnit) return;

    updateUnit(
      {
        unitId: editingUnit.id,
        payload: {
          name: formData.name,
          code: formData.code,
          category: formData.category,
          isActive: formData.isActive,
        },
      },
      {
        onSuccess: () => {
          setIsAddEditModalOpen(false);
          setEditingUnit(null);
        },
      }
    );
  };

  const handleDeleteUnit = () => {
    if (!unitToDelete) return;

    deleteUnit(unitToDelete.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setUnitToDelete(null);
      },
    });
  };

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (unit: InventoryUnit) => {
    setEditingUnit(unit);
    setIsAddEditModalOpen(true);
  };

  const handleOpenDeleteModal = (unit: InventoryUnit) => {
    setUnitToDelete(unit);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return <CustomLoading />;
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Something went wrong
          </h3>
          <p className="text-gray-500">
            Failed to load units. Please try again.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        {units.length > 0 ? (
          <UnitsList
            units={units}
            onAddUnit={handleOpenAddModal}
            onEditUnit={handleOpenEditModal}
            onDeleteUnit={handleOpenDeleteModal}
          />
        ) : (
          <NoUnits onAddUnit={handleOpenAddModal} />
        )}
      </div>

      <AddEditUnitModal
        isOpen={isAddEditModalOpen}
        onOpenChange={(open) => {
          setIsAddEditModalOpen(open);
          if (!open) setEditingUnit(null);
        }}
        onSubmit={editingUnit ? handleEditUnit : handleCreateUnit}
        isLoading={isCreating || isUpdating}
        isEdit={!!editingUnit}
        initialData={editingUnit}
      />

      <DeleteUnitModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteUnit}
        unit={unitToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
