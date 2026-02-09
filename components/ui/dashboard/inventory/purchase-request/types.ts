export type PurchaseRequestStatus = 'Saved' | 'Sent' | 'Received' | 'Stocked';

export interface SupplierInventoryItem {
  id: string;
  name: string;
  unitName: string;
  costPerUnit: number;
  optimumStock: number;
  currentStock: number;
  status: 'Low' | 'Optimum';
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
  contactName?: string;
}
