'use client';

import React, { useState, useMemo } from 'react';
import { Spinner } from '@nextui-org/react';
import { LuPlus, LuHistory } from 'react-icons/lu';

import { useQuery } from '@tanstack/react-query';
import useSuppliers from '@/hooks/cachedEndpoints/useSuppliers';
import { useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';
import { getSupplier } from '@/app/api/controllers/dashboard/supplier';
import {
  createPurchaseOrder,
  getPurchaseOrdersByBusiness,
  getPurchaseOrder,
  duplicatePurchaseOrder,
  cancelPurchaseOrder,
  receivePurchaseOrder,
  sendPurchaseOrderMail,
} from '@/app/api/controllers/dashboard/purchaseOrder';
import { fetchQueryConfig } from '@/lib/queryConfig';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { Supplier } from '@/components/ui/dashboard/inventory/suppliers/types';
import {
  SupplierInventoryItem,
  PurchaseRequest,
  PurchaseRequestItem,
  purchaseOrderStatusMap,
} from '@/components/ui/dashboard/inventory/purchase-request/types';
import PurchaseRequestHeader from '@/components/ui/dashboard/inventory/purchase-request/PurchaseRequestHeader';
import SupplierSearchCard from '@/components/ui/dashboard/inventory/purchase-request/SupplierSearchCard';
import SupplierItemsTable from '@/components/ui/dashboard/inventory/purchase-request/SupplierItemsTable';
import NoSupplierItems from '@/components/ui/dashboard/inventory/purchase-request/NoSupplierItems';
import PurchaseRequestHistoryTable from '@/components/ui/dashboard/inventory/purchase-request/PurchaseRequestHistoryTable';
import CustomizePurchaseModal from '@/components/ui/dashboard/inventory/purchase-request/CustomizePurchaseModal';
import SendEmailModal from '@/components/ui/dashboard/inventory/purchase-request/SendEmailModal';
import PurchaseSuccessModal from '@/components/ui/dashboard/inventory/purchase-request/PurchaseSuccessModal';
import ReceivedItemsModal from '@/components/ui/dashboard/inventory/purchase-request/ReceivedItemsModal';


export default function PurchaseRequestPage() {
  // Hooks
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: units } = useUnitsByBusiness();

  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation?.[0]?.businessId;
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  // Tab state
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Purchase order history pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(10);
  // Fetch real purchase orders
  const { data: purchaseOrdersData, refetch: refetchOrders } = useQuery<{ orders: PurchaseRequest[]; totalCount: number }>({
    queryKey: ['purchaseOrderHistory', businessId, historyPage, historyPageSize],
    queryFn: async () => {
      const response = await getPurchaseOrdersByBusiness(businessId, historyPage, historyPageSize);
      const responseBody = response?.data;
      // Handle paginated response: { data: { items: [...], totalCount }, isSuccessful }
      const paginated = responseBody?.data;
      const rawItems = paginated?.items ?? paginated ?? [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      return {
        orders: items.map((o: any) => ({
          requestId: o.purchaseOrderId || o.id || '',
          supplierId: o.supplierId || '',
          supplierName: o.supplierName || '',
          companyName: o.supplierCompanyName || '',
          requestDate: o.dateUpdated
            ? new Date(o.dateUpdated).toLocaleDateString('en-GB')
            : o.orderDate && o.orderDate !== '0001-01-01T00:00:00'
              ? new Date(o.orderDate).toLocaleDateString('en-GB')
              : '-',
          expectedDeliveryDate: o.expectedDate
            ? new Date(o.expectedDate).toLocaleDateString('en-GB')
            : '-',
          numberOfItems: Math.round(o.numberOfItems ?? 0),
          totalCost: o.totalAmount ?? 0,
          status: purchaseOrderStatusMap[o.status] ?? 'Pending',
          items: [],
          deliveryAddress: o.deliveryAddress || '',
          supplierEmail: o.supplierEmail || '',
          reference: o.reference || '',
        })) as PurchaseRequest[],
        totalCount: paginated?.totalCount ?? items.length,
      };
    },
    enabled: !!businessId,
    ...fetchQueryConfig(),
    placeholderData: undefined,
    staleTime: 0,
  });

  const purchaseOrders = purchaseOrdersData?.orders ?? [];
  const purchaseOrdersTotalCount = purchaseOrdersData?.totalCount ?? 0;

  // Modal states
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [sendEmailModalOpen, setSendEmailModalOpen] = useState(false);
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(null);

  // Loading states
  const [sendingPurchase, setSendingPurchase] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [receivingStock, setReceivingStock] = useState(false);
  const [fetchingOrderDetails, setFetchingOrderDetails] = useState(false);
  const [duplicatingOrder, setDuplicatingOrder] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const isActionLoading = fetchingOrderDetails || duplicatingOrder || cancellingOrder;

  // Derived data
  const selectedSupplier: Supplier | null = useMemo(
    () => suppliers.find((s) => s.supplierId === selectedSupplierId) || null,
    [suppliers, selectedSupplierId]
  );

  // Build unit lookup map: unitId → display name
  const unitMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of units) {
      map.set(u.id, u.name);
    }
    return map;
  }, [units]);

  // Fetch supplier data (including items) when a supplier is selected
  const { data: supplierItems = [], isFetching: isLoadingSupplierItems } = useQuery<SupplierInventoryItem[]>({
    queryKey: ['supplier', selectedSupplierId],
    queryFn: async () => {
      const response = await getSupplier(selectedSupplierId);
      const items = response?.data?.data?.items;
      if (!Array.isArray(items)) return [];

      return items.map((item: any) => {
        const currentStock = item.stock ?? 0;
        const optimumStock = item.reorderLevel ?? 0;
        return {
          id: item.id,
          name: item.name,
          unitName: unitMap.get(item.unitId) || item.unit || 'N/A',
          costPerUnit: item.averageCostPerUnit ?? 0,
          optimumStock,
          currentStock,
          status: (currentStock < optimumStock ? 'Low' : 'Optimum') as 'Low' | 'Optimum',
        };
      });
    },
    enabled: !!selectedSupplierId,
    ...fetchQueryConfig(),
    retry: 1,
  });

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
      notify({ title: 'Error!', text: 'Please select at least one item', type: 'error' });
      return;
    }
    setCustomizeModalOpen(true);
  };


  const handleSendPurchaseRequest = async (data: {
    items: PurchaseRequestItem[];
    deliveryAddress: string;
    expectedDate: string;
    vatPercent: number;
    vatAmount: number;
    additionalCostLabel: string;
    additionalCost: number;
    subTotal: number;
    grandTotal: number;
  }) => {
    setSendingPurchase(true);
    try {
      const payload = {
        supplierID: selectedSupplier?.supplierId || '',
        expectedDate: new Date(data.expectedDate).toISOString(),
        additionalCostName: data.additionalCostLabel,
        additionalCost: data.additionalCost,
        totalAmount: data.grandTotal,
        vatAmount: data.vatAmount,
        vatRate: data.vatPercent,
        isVatApplied: data.vatPercent > 0,
        orderDetails: data.items.map((item) => ({
          inventoryItemID: item.id,
          requestedQuantity: item.requiredStock,
          purchaseCost: item.cost,
        })),
      };

      const response = await createPurchaseOrder(businessId, payload);
      if (response?.data?.isSuccessful) {
        setPurchaseOrderId(response.data.data?.id || response.data.data);
        setCustomizeModalOpen(false);
        setSuccessModalOpen(true);
        refetchOrders();
      } else {
        notify({ title: 'Error!', text: response?.data?.error?.responseDescription || 'Failed to create purchase order', type: 'error' });
      }
    } finally {
      setSendingPurchase(false);
    }
  };

  const handleNotifySupplier = () => {
    setSuccessModalOpen(false);
    setSendEmailModalOpen(true);
  };

  const handleSendEmail = async (to: string, cc: string, subject: string, message: string, attachment: File | null) => {
    setSendingEmail(true);
    try {
      const formData = new FormData();
      formData.append('PurchaseOrderId', purchaseOrderId || '');
      formData.append('To', to);
      formData.append('From', userInformation?.email || '');
      formData.append('Subject', subject);
      formData.append('Cc', cc);
      formData.append('Content', message);
      if (attachment) {
        formData.append('Attachment', attachment);
      }

      const response = await sendPurchaseOrderMail(formData);
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Purchase request email sent successfully', type: 'success' });
        setSendEmailModalOpen(false);
      } else {
        notify({ title: 'Error!', text: response?.data?.error?.responseDescription || 'Failed to send email', type: 'error' });
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchFullPurchaseOrder = async (request: PurchaseRequest): Promise<PurchaseRequest> => {
    try {
      const response = await getPurchaseOrder(request.requestId);
      const o = response?.data?.data;
      if (!o) return request;
      return {
        ...request,
        supplierId: o.supplierID || o.supplierId || request.supplierId,
        supplierName: o.supplierName || request.supplierName,
        companyName: o.supplierCompanyName || o.companyName || request.companyName,
        deliveryAddress: o.supplierAddress || o.deliveryAddress || request.deliveryAddress,
        supplierEmail: o.supplierEmail || request.supplierEmail,
        supplierPhone: o.supplierPhoneNumber || o.supplierPhone || request.supplierPhone,
        supplierAddress: o.supplierAddress || request.supplierAddress,
        contactName: o.contactName || request.contactName,
        reference: o.reference || request.reference,
        totalCost: o.totalAmount ?? request.totalCost,
        subTotalAmount: o.subTotalAmount ?? 0,
        vatAmount: o.vatAmount ?? 0,
        vatRate: o.vatRate ?? 0,
        isVatApplied: o.isVatApplied ?? false,
        additionalCost: o.additionalCost ?? 0,
        additionalCostName: o.additionalCostName || '',
        numberOfItems: Math.round(o.numberOfItems ?? o.orderDetails?.length ?? request.numberOfItems),
        items: (o.orderDetails || []).map((d: any) => ({
          id: d.inventoryItemID || d.id,
          itemName: d.inventoryItemName || d.itemName || '',
          unitName: d.inventoryUnitName || d.unitName || 'N/A',
          costPerUnit: d.requestedQuantity ? d.purchaseCost / d.requestedQuantity : 0,
          requiredStock: d.requestedQuantity || 0,
          cost: d.purchaseCost || 0,
        })),
      };
    } catch {
      return request;
    }
  };

  const handleViewRequest = async (request: PurchaseRequest) => {
    setFetchingOrderDetails(true);
    try {
      const fullOrder = await fetchFullPurchaseOrder(request);
      setSelectedPurchaseRequest(fullOrder);
      if (fullOrder.status === 'Received') {
        setReceivedModalOpen(true);
      } else {
        setViewModalOpen(true);
      }
    } finally {
      setFetchingOrderDetails(false);
    }
  };

  const handleReceiveRequest = async (request: PurchaseRequest) => {
    setFetchingOrderDetails(true);
    try {
      const fullOrder = await fetchFullPurchaseOrder(request);
      setSelectedPurchaseRequest(fullOrder);
      setReceivedModalOpen(true);
    } finally {
      setFetchingOrderDetails(false);
    }
  };

  const handleDuplicateRequest = async (request: PurchaseRequest) => {
    setDuplicatingOrder(true);
    try {
      // Fetch full PO details first
      const detailResponse = await getPurchaseOrder(request.requestId);
      const poData = detailResponse?.data?.data;

      const response = await duplicatePurchaseOrder(request.requestId, businessId, poData || {});
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Purchase order duplicated successfully', type: 'success' });
        refetchOrders();
      } else {
        notify({ title: 'Error!', text: response?.data?.error?.responseDescription || 'Failed to duplicate purchase order', type: 'error' });
      }
    } catch {
      // Interceptor already shows error toast
    } finally {
      setDuplicatingOrder(false);
    }
  };

  const handleCancelRequest = async (request: PurchaseRequest) => {
    setCancellingOrder(true);
    try {
      const response = await cancelPurchaseOrder(request.requestId);
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Purchase order cancelled successfully', type: 'success' });
        refetchOrders();
      } else {
        notify({ title: 'Error!', text: response?.data?.error?.responseDescription || 'Failed to cancel purchase order', type: 'error' });
      }
    } catch {
      // Interceptor already shows error toast
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleSendMailFromHistory = (request: PurchaseRequest) => {
    setPurchaseOrderId(request.requestId);
    setSelectedPurchaseRequest(request);
    setSendEmailModalOpen(true);
  };

  const handleReceivedStock = async (requestId: string, receivedItems: { id: string; stockReceived: number }[]) => {
    setReceivingStock(true);
    try {
      const payload = {
        purchaseOrderId: requestId,
        isPaymentMade: true,
        orderDetails: receivedItems.map((i) => ({
          inventoryItemID: i.id,
          receivedQuantity: i.stockReceived,
        })),
      };

      const response = await receivePurchaseOrder(businessId, payload);
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Stock items received successfully', type: 'success' });
        setReceivedModalOpen(false);
        refetchOrders();
      } else {
        notify({ title: 'Error!', text: response?.data?.error?.responseDescription || 'Failed to receive stock items', type: 'error' });
      }
    } finally {
      setReceivingStock(false);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      <PurchaseRequestHeader />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-[#5F35D2] text-[#5F35D2]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <LuPlus size={16} />
          Create Order
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-[#5F35D2] text-[#5F35D2]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <LuHistory size={16} />
          Order History
          {purchaseOrdersTotalCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'history'
                ? 'bg-[#5F35D2]/10 text-[#5F35D2]'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {purchaseOrdersTotalCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <>
          <SupplierSearchCard
            suppliers={suppliers}
            selectedSupplierId={selectedSupplierId}
            onSupplierSelect={handleSupplierSelect}
            isLoading={suppliersLoading}
          />

          {selectedSupplierId && isLoadingSupplierItems ? (
            <div className="flex flex-col items-center justify-center w-full bg-white rounded-lg p-8 min-h-[300px]">
              <Spinner size="lg" color="secondary" />
              <p className="text-sm text-gray-500 mt-4">Loading supplier items...</p>
            </div>
          ) : selectedSupplierId && supplierItems.length > 0 ? (
            <SupplierItemsTable
              items={supplierItems}
              selectedItems={selectedItemIds}
              onSelectionChange={setSelectedItemIds}
              onCustomize={handleCustomize}
            />
          ) : (
            <NoSupplierItems />
          )}
        </>
      )}

      {activeTab === 'history' && (
        <PurchaseRequestHistoryTable
          data={purchaseOrders}
          onViewRequest={handleViewRequest}
          onReceiveRequest={handleReceiveRequest}
          onDuplicateRequest={handleDuplicateRequest}
          onCancelRequest={handleCancelRequest}
          onSendMail={handleSendMailFromHistory}
          currentPage={historyPage}
          totalCount={purchaseOrdersTotalCount}
          pageSize={historyPageSize}
          onPageChange={setHistoryPage}
          isActionLoading={isActionLoading}
        />
      )}

      {/* Modals */}
      <CustomizePurchaseModal
        isOpen={customizeModalOpen}
        onOpenChange={setCustomizeModalOpen}
        supplier={selectedSupplier}
        selectedItems={selectedSupplierItems}
        onSend={handleSendPurchaseRequest}
        isLoading={sendingPurchase}
      />

      <PurchaseSuccessModal
        isOpen={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        onNotifySupplier={handleNotifySupplier}
        onClose={() => setSuccessModalOpen(false)}
      />

      <SendEmailModal
        isOpen={sendEmailModalOpen}
        onOpenChange={setSendEmailModalOpen}
        supplierEmail={selectedPurchaseRequest?.supplierEmail || selectedSupplier?.email || ''}
        businessName="My Business"
        onSend={handleSendEmail}
        isLoading={sendingEmail}
      />

      <ReceivedItemsModal
        isOpen={receivedModalOpen}
        onOpenChange={setReceivedModalOpen}
        purchaseRequest={selectedPurchaseRequest}
        onUpdateStock={(requestId, receivedItems) => {
          setReceivedModalOpen(false);
        }}
        onReceivedStock={handleReceivedStock}
        isLoading={receivingStock}
      />

    </div>
  );
}
