export type PurchaseRequestStatus = 'Pending' | 'Cancelled' | 'Closed' | 'Received';

export const purchaseOrderStatusMap: Record<number, PurchaseRequestStatus> = {
  0: 'Pending',
  1: 'Cancelled',
  2: 'Closed',
  3: 'Received',
};

export const itemTypeLabels = ['Direct', 'Ingredient', 'Produced'];

export interface SupplierInventoryItem {
  id: string;
  name: string;
  itemType: string;
  unitName: string;
  costPerUnit: number;
  status: 'Active' | 'Inactive';
}

export interface PurchaseRequestItem {
  id: string;
  itemName: string;
  unitName: string;
  costPerUnit: number;
  requiredStock: number;
  cost: number;
}

export interface PurchaseRequest {
  requestId: string;
  supplierId?: string;
  reference?: string;
  supplierName: string;
  companyName: string;
  requestDate: string;
  expectedDeliveryDate: string;
  numberOfItems: number;
  totalCost: number;
  status: PurchaseRequestStatus;
  items: PurchaseRequestItem[];
  deliveryAddress: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  contactName?: string;
  subTotalAmount?: number;
  vatAmount?: number;
  vatRate?: number;
  isVatApplied?: boolean;
  additionalCost?: number;
  additionalCostName?: string;
  rawExpectedDate?: string;
}
