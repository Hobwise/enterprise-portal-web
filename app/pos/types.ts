import { ReactNode } from 'react';

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
  isVatEnabled?: boolean;
  vatRate?: number;
};

export type Variety = {
  id: string;
  unit: string;
  name?: string;
  description?: string;
  price: number;
  currency?: string;
  isAvailable?: boolean;
  itemID?: string;
  menuID?: string;
};

export type MenuItem = {
  id: string;
  itemName: string;
  itemDescription?: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  varieties?: Variety[] | null;
  isVariety?: boolean;
  image?: string;
  uniqueKey?: string;
  menuName: string;
  menuId: string;
  packingCost: number;
  waitingTimeMinutes?: number;
  sectionName: string;
  sectionId: string;
  isVatEnabled?: boolean;
  vatRate?: number;
  isPacked?: boolean;
  [x: string]: any;
};

export type OrderSummary = {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemCount: number;
};
