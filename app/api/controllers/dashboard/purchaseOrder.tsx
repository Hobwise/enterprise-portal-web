import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function createPurchaseOrder(businessId: string, payload: {
  supplierID: string;
  expectedDate: string;
  additionalCostName: string;
  additionalCost: number;
  totalAmount: number;
  vatAmount: number;
  vatRate: number;
  isVatApplied: boolean;
  orderDetails: { inventoryItemID: string; requestedQuantity: number; purchaseCost: number }[];
}) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.purchaseOrder, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPurchaseOrdersByBusiness(
  businessId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  const headers = businessId ? { businessId } : {};

  try {
    let url = `${DASHBOARD.purchaseOrderByBusiness}?Page=${page}&PageSize=${pageSize}`;
    if (search) url += `&Search=${encodeURIComponent(search)}`;
    const data = await api.get(url, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getPurchaseOrder(purchaseOrderId: string) {
  const headers = purchaseOrderId ? { purchaseOrderId } : {};

  try {
    const data = await api.get(DASHBOARD.purchaseOrder, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function duplicatePurchaseOrder(purchaseOrderId: string, businessId: string, payload?: any) {
  const headers: Record<string, string> = {};
  if (purchaseOrderId) headers.purchaseOrderId = purchaseOrderId;
  if (businessId) headers.businessId = businessId;

  try {
    const data = await api.put(DASHBOARD.purchaseOrder, payload || {}, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function cancelPurchaseOrder(purchaseOrderId: string) {
  const headers = purchaseOrderId ? { purchaseOrderId } : {};

  try {
    const data = await api.delete(DASHBOARD.purchaseOrder, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function receivePurchaseOrder(businessId: string, payload: {
  purchaseOrderId: string;
  isPaymentMade: boolean;
  orderDetails: { inventoryItemID: string; receivedQuantity: number }[];
}) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.purchaseOrderReceive, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function updatePurchaseOrder(purchaseOrderId: string, businessId: string, payload: {
  supplierID: string;
  expectedDate: string;
  additionalCostName: string;
  additionalCost: number;
  totalAmount: number;
  vatAmount: number;
  vatRate: number;
  isVatApplied: boolean;
  orderDetails: { inventoryItemID: string; requestedQuantity: number; purchaseCost: number }[];
}) {
  const headers: Record<string, string> = {};
  if (purchaseOrderId) headers.purchaseOrderId = purchaseOrderId;
  if (businessId) headers.businessId = businessId;

  try {
    const data = await api.put(DASHBOARD.purchaseOrder, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function sendPurchaseOrderMail(formData: FormData) {
  try {
    const data = await api.post(DASHBOARD.purchaseOrderSendMail, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
