'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import useSuppliers from '@/hooks/cachedEndpoints/useSuppliers';
import useInventoryItems from '@/hooks/cachedEndpoints/useInventoryItems';
import { Supplier } from '@/components/ui/dashboard/inventory/suppliers/types';
import {
  SupplierInventoryItem,
  PurchaseRequest,
  PurchaseRequestItem,
} from '@/components/ui/dashboard/inventory/purchase-request/types';
import PurchaseRequestHeader from '@/components/ui/dashboard/inventory/purchase-request/PurchaseRequestHeader';
import SupplierSearchCard from '@/components/ui/dashboard/inventory/purchase-request/SupplierSearchCard';
import SupplierItemsTable from '@/components/ui/dashboard/inventory/purchase-request/SupplierItemsTable';
import NoSupplierItems from '@/components/ui/dashboard/inventory/purchase-request/NoSupplierItems';
import PurchaseRequestHistoryTable from '@/components/ui/dashboard/inventory/purchase-request/PurchaseRequestHistoryTable';
import CustomizePurchaseModal from '@/components/ui/dashboard/inventory/purchase-request/CustomizePurchaseModal';
import SendEmailModal from '@/components/ui/dashboard/inventory/purchase-request/SendEmailModal';
import ReceivedItemsModal from '@/components/ui/dashboard/inventory/purchase-request/ReceivedItemsModal';
import ViewPurchaseRequestModal from '@/components/ui/dashboard/inventory/purchase-request/ViewPurchaseRequestModal';

// Mock purchase request history data
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    requestId: 'PR-001',
    supplierName: 'John Doe',
    companyName: 'ABC Supplies Ltd',
    requestDate: '2025-01-15',
    expectedDeliveryDate: '2025-01-22',
    numberOfItems: 5,
    totalCost: 125000,
    status: 'Sent',
    deliveryAddress: '12 Broad Street, Lagos',
    supplierEmail: 'john@abcsupplies.com',
    supplierPhone: '+234 801 234 5678',
    contactName: 'John Doe',
    items: [
      { id: '1', itemName: 'Tomato Paste', unitName: 'Carton', costPerUnit: 15000, requiredStock: 5, cost: 75000 },
      { id: '2', itemName: 'Vegetable Oil', unitName: 'Litre', costPerUnit: 2500, requiredStock: 20, cost: 50000 },
    ],
  },
  {
    requestId: 'PR-002',
    supplierName: 'Jane Smith',
    companyName: 'Fresh Foods Co',
    requestDate: '2025-01-10',
    expectedDeliveryDate: '2025-01-17',
    numberOfItems: 3,
    totalCost: 85000,
    status: 'Received',
    deliveryAddress: '5 Marina Road, Lagos',
    supplierEmail: 'jane@freshfoods.com',
    supplierPhone: '+234 802 345 6789',
    contactName: 'Jane Smith',
    items: [
      { id: '3', itemName: 'Rice', unitName: 'Bag', costPerUnit: 25000, requiredStock: 2, cost: 50000 },
      { id: '4', itemName: 'Beans', unitName: 'Bag', costPerUnit: 17500, requiredStock: 2, cost: 35000 },
    ],
  },
  {
    requestId: 'PR-003',
    supplierName: 'Mike Johnson',
    companyName: 'Wholesale Depot',
    requestDate: '2025-01-05',
    expectedDeliveryDate: '2025-01-12',
    numberOfItems: 8,
    totalCost: 250000,
    status: 'Stocked',
    deliveryAddress: '8 Allen Avenue, Ikeja',
    supplierEmail: 'mike@wholesaledepot.com',
    supplierPhone: '+234 803 456 7890',
    contactName: 'Mike Johnson',
    items: [
      { id: '5', itemName: 'Flour', unitName: 'Bag', costPerUnit: 12000, requiredStock: 10, cost: 120000 },
      { id: '6', itemName: 'Sugar', unitName: 'Bag', costPerUnit: 13000, requiredStock: 10, cost: 130000 },
    ],
  },
  {
    requestId: 'PR-004',
    supplierName: 'Sarah Williams',
    companyName: 'Premium Ingredients',
    requestDate: '2025-01-02',
    expectedDeliveryDate: '2025-01-09',
    numberOfItems: 4,
    totalCost: 62000,
    status: 'Saved',
    deliveryAddress: '15 Lekki Phase 1, Lagos',
    supplierEmail: 'sarah@premiumingredients.com',
    supplierPhone: '+234 804 567 8901',
    contactName: 'Sarah Williams',
    items: [
      { id: '7', itemName: 'Pepper', unitName: 'Kg', costPerUnit: 3500, requiredStock: 10, cost: 35000 },
      { id: '8', itemName: 'Onions', unitName: 'Kg', costPerUnit: 2700, requiredStock: 10, cost: 27000 },
    ],
  },
];

export default function PurchaseRequestPage() {
  // Hooks
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: inventoryItems } = useInventoryItems({ pageSize: 200 });

  // State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [purchaseRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);

  // Modal states
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [sendEmailModalOpen, setSendEmailModalOpen] = useState(false);
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(null);

  // Derived data
  const selectedSupplier: Supplier | null = useMemo(
    () => suppliers.find((s) => s.supplierId === selectedSupplierId) || null,
    [suppliers, selectedSupplierId]
  );

  const supplierItems: SupplierInventoryItem[] = useMemo(() => {
    if (!selectedSupplierId) return [];

    return inventoryItems
      .filter((item) => item.supplierId === selectedSupplierId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        unitName: item.unitName || item.unit || 'N/A',
        costPerUnit: item.averageCostPerUnit || 0,
        optimumStock: item.reorderLevel || 0,
        currentStock: item.stockLevel || 0,
        status: (item.stockLevel || 0) < (item.reorderLevel || 0) ? 'Low' as const : 'Optimum' as const,
      }));
  }, [inventoryItems, selectedSupplierId]);

  const selectedSupplierItems: SupplierInventoryItem[] = useMemo(
    () => supplierItems.filter((item) => selectedItemIds.has(item.id)),
    [supplierItems, selectedItemIds]
  );

  // Handlers
  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedItemIds(new Set());
  };

  const handleCustomize = () => {
    if (selectedItemIds.size === 0) {
      toast.error('Please select at least one item');
      return;
    }
    setCustomizeModalOpen(true);
  };

  const handleSavePurchaseRequest = (
    items: PurchaseRequestItem[],
    deliveryAddress: string,
    expectedDate: string
  ) => {
    toast.success('Purchase request saved (backend integration pending)');
    setCustomizeModalOpen(false);
  };

  const handleSendPurchaseRequest = (
    items: PurchaseRequestItem[],
    deliveryAddress: string,
    expectedDate: string
  ) => {
    setCustomizeModalOpen(false);
    setSendEmailModalOpen(true);
  };

  const handleSendEmail = (to: string, cc: string, subject: string, message: string) => {
    toast.success('Purchase request email sent (backend integration pending)');
    setSendEmailModalOpen(false);
  };

  const handleViewRequest = (request: PurchaseRequest) => {
    setSelectedPurchaseRequest(request);
    if (request.status === 'Received') {
      setReceivedModalOpen(true);
    } else {
      setViewModalOpen(true);
    }
  };

  const handleReceiveRequest = (request: PurchaseRequest) => {
    setSelectedPurchaseRequest(request);
    setReceivedModalOpen(true);
  };

  const handleDeleteRequest = (request: PurchaseRequest) => {
    toast.success(`Purchase request ${request.requestId} deleted (backend integration pending)`);
  };

  const handleUpdateStock = (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => {
    toast.success('Stock count updated (backend integration pending)');
    setReceivedModalOpen(false);
  };

  const handleReceivedStock = (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => {
    toast.success('Stock items received (backend integration pending)');
    setReceivedModalOpen(false);
  };

  return (
    <div className="w-full px-4 py-6">
      <PurchaseRequestHeader />

      <SupplierSearchCard
        suppliers={suppliers}
        selectedSupplierId={selectedSupplierId}
        onSupplierSelect={handleSupplierSelect}
        isLoading={suppliersLoading}
      />

      {selectedSupplierId && supplierItems.length > 0 ? (
        <SupplierItemsTable
          items={supplierItems}
          selectedItems={selectedItemIds}
          onSelectionChange={setSelectedItemIds}
          onCustomize={handleCustomize}
        />
      ) : (
        <div className="mb-8">
          <NoSupplierItems />
        </div>
      )}

      <PurchaseRequestHistoryTable
        data={purchaseRequests}
        onViewRequest={handleViewRequest}
        onDeleteRequest={handleDeleteRequest}
        onReceiveRequest={handleReceiveRequest}
      />

      {/* Modals */}
      <CustomizePurchaseModal
        isOpen={customizeModalOpen}
        onOpenChange={setCustomizeModalOpen}
        supplier={selectedSupplier}
        selectedItems={selectedSupplierItems}
        onSave={handleSavePurchaseRequest}
        onSend={handleSendPurchaseRequest}
      />

      <SendEmailModal
        isOpen={sendEmailModalOpen}
        onOpenChange={setSendEmailModalOpen}
        supplierEmail={selectedSupplier?.email || ''}
        businessName="My Business"
        onSend={handleSendEmail}
      />

      <ReceivedItemsModal
        isOpen={receivedModalOpen}
        onOpenChange={setReceivedModalOpen}
        purchaseRequest={selectedPurchaseRequest}
        onUpdateStock={handleUpdateStock}
        onReceivedStock={handleReceivedStock}
      />

      <ViewPurchaseRequestModal
        isOpen={viewModalOpen}
        onOpenChange={setViewModalOpen}
        purchaseRequest={selectedPurchaseRequest}
      />
    </div>
  );
}
