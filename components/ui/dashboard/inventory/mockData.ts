// Mock data for Inventory Dashboard

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  lowStockThreshold: number;
  inventoryValue: number;
  pendingPurchase: number;
}

export interface ItemSold {
  name: string;
  stockPercentage: number;
  soldCount: number;
}

export interface RecentPurchaseOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  items: string;
  status: 'Sent' | 'Pending' | 'Received';
  timestamp: string;
}

export interface RecentStockTransfer {
  id: string;
  transferNumber: string;
  storeName: string;
  items: string;
  status: 'Sent' | 'Pending' | 'Completed';
  timestamp: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentPercentage: number;
}

export interface InventoryDashboardData {
  stats: InventoryStats;
  itemsSold: ItemSold[];
  stockTransfers: number;
  totalSuppliers: number;
  recentPurchaseOrders: RecentPurchaseOrder[];
  recentStockTransfers: RecentStockTransfer[];
  lowStockItems: LowStockItem[];
}

export const mockInventoryData: InventoryDashboardData = {
  stats: {
    totalItems: 127,
    lowStockItems: 1,
    lowStockThreshold: 25,
    inventoryValue: 27584275,
    pendingPurchase: 3,
  },
  itemsSold: [
    { name: 'Item 1', stockPercentage: 10, soldCount: 45 },
    { name: 'Item 2', stockPercentage: 95, soldCount: 120 },
    { name: 'Item 3', stockPercentage: 85, soldCount: 89 },
    { name: 'Item 4', stockPercentage: 90, soldCount: 156 },
    { name: 'Item 5', stockPercentage: 55, soldCount: 67 },
    { name: 'Item 6', stockPercentage: 65, soldCount: 78 },
    { name: 'Item 7', stockPercentage: 80, soldCount: 134 },
    { name: 'Item 8', stockPercentage: 45, soldCount: 56 },
    { name: 'Item 9', stockPercentage: 70, soldCount: 92 },
    { name: 'Item 10', stockPercentage: 35, soldCount: 43 },
    { name: 'Item 11', stockPercentage: 75, soldCount: 87 },
    { name: 'Item 12', stockPercentage: 60, soldCount: 71 },
  ],
  stockTransfers: 3,
  totalSuppliers: 3,
  recentPurchaseOrders: [
    {
      id: '1',
      orderNumber: 'PO12345',
      supplierName: 'Suppliers Name.',
      items: 'Golden Penny 50kg Rice, Golden Penny Floor 50kg, Beans,...',
      status: 'Sent',
      timestamp: '13 minutes ago',
    },
  ],
  recentStockTransfers: [
    {
      id: '1',
      transferNumber: 'PO12345',
      storeName: 'Store Name.',
      items: 'Golden Penny 50kg Rice, Golden Penny Floor 50kg, Beans,...',
      status: 'Sent',
      timestamp: '13 minutes ago',
    },
    {
      id: '2',
      transferNumber: 'PO12345',
      storeName: 'Store Name.',
      items: 'Golden Penny 50kg Rice, Golden Penny Floor 50kg, Beans,...',
      status: 'Sent',
      timestamp: '13 minutes ago',
    },
  ],
  lowStockItems: [
    { id: '1', name: 'Item 1', currentPercentage: 22 },
    { id: '2', name: 'Item 1', currentPercentage: 25 },
    { id: '3', name: 'Item 1', currentPercentage: 24 },
    { id: '4', name: 'Item 1', currentPercentage: 23 },
    { id: '5', name: 'Item 1', currentPercentage: 25 },
    { id: '6', name: 'Item 1', currentPercentage: 25 },
    { id: '7', name: 'Item 1', currentPercentage: 20 },
    { id: '8', name: 'Item 1', currentPercentage: 19 },
  ],
};
