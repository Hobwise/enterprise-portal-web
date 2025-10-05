// POS Types
export type Item = {
  id: string;
  itemID: string;
  itemName: string;
  menuName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image?: string;
  isVariety: boolean;
  varieties: null | any;
  count: number;
  packingCost: number;
  isPacked?: boolean;
};

export type MenuItem = {
  id: string;
  itemName: string;
  itemDescription?: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  uniqueKey?: string;
  menuName: string;
  menuId: string;
  packingCost: number;
  waitingTimeMinutes?: number;
  sectionName: string;
  sectionId: string;
};

export type OrderSummary = {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemCount: number;
};
