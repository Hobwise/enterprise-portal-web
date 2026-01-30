'use client';

import React, { useState } from 'react';
import NoSuppliers from '@/components/ui/dashboard/inventory/suppliers/NoSuppliers';
import SuppliersList from '@/components/ui/dashboard/inventory/suppliers/SuppliersList';
import AddSupplierModal, { SupplierFormData } from '@/components/ui/dashboard/inventory/suppliers/AddSupplierModal';
import SupplierDetailModal from '@/components/ui/dashboard/inventory/suppliers/SupplierDetailModal';
import { Supplier } from '@/components/ui/dashboard/inventory/suppliers/types';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';
import useSuppliers from '@/hooks/cachedEndpoints/useSuppliers';

import DeleteSupplierModal from '@/components/ui/dashboard/inventory/suppliers/DeleteSupplierModal';

export default function SuppliersPage() {
  const { data: suppliers, isLoading, createSupplier, isCreating, updateSupplier, isUpdating, deleteSupplier, isDeleting, isError, refetch } = useSuppliers();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const selectedSupplier = React.useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  const handleCreateSupplier = async (formData: SupplierFormData) => {
    try {
      const payload = {
        name: formData.name,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        physicalAddress: formData.physicalAddress,
        isActive: true,
      };

      await createSupplier(payload, {
        onSuccess: () => {
          setIsAddModalOpen(false);
        }
      });
    } catch (error) {
      console.error('Error in handleCreateSupplier:', error);
    }
  };

  const handleEditSupplier = async (formData: SupplierFormData) => {
    if (!editingSupplier) return;

    try {
      const payload = {
        name: formData.name,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        physicalAddress: formData.physicalAddress,
        isActive: editingSupplier.status === 'active',
      };

      await updateSupplier({ supplierId: editingSupplier.supplierId, payload }, {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setEditingSupplier(null);
        }
      });
    } catch (error) {
      console.error('Error in handleEditSupplier:', error);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    await deleteSupplier(supplierToDelete.supplierId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSupplierToDelete(null);
      }
    });
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
     setIsDetailModalOpen(false);
     setEditingSupplier(supplier);
     setIsAddModalOpen(true);
  };
  
  const handleOpenDeleteModal = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
      setSelectedSupplierId(supplier.id);
      setIsDetailModalOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return <CustomLoading />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
          <p className="text-gray-500">Failed to load suppliers. Please try again.</p>
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
    <div className='h-full flex flex-col'>
      <div className="flex-1">
        {suppliers.length > 0 ? (
            <SuppliersList 
                suppliers={suppliers} 
                onAddSupplier={handleOpenAddModal}
                onViewSupplier={handleViewSupplier}
                onEditSupplier={handleOpenEditModal}
                onDeleteSupplier={handleOpenDeleteModal}
            />
        ) : (
            <NoSuppliers onRegister={handleOpenAddModal} />
        )}
      </div>

      <AddSupplierModal 
        isOpen={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingSupplier(null);
        }}
        onSubmit={editingSupplier ? handleEditSupplier : handleCreateSupplier}
        isLoading={isCreating || isUpdating}
        isEdit={!!editingSupplier}
        initialData={editingSupplier ? {
          name: editingSupplier.name,
          companyName: editingSupplier.companyName,
          phoneNumber: editingSupplier.phoneNumber,
          emailAddress: editingSupplier.email,
          physicalAddress: editingSupplier.address,
        } : undefined}
      />

      <SupplierDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        supplier={selectedSupplier}
        onEdit={() => selectedSupplier && handleOpenEditModal(selectedSupplier)}
      />

      <DeleteSupplierModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteSupplier}
        supplier={supplierToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
