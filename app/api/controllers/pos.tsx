import { DASHBOARD } from "../api-url";
import api, { handleError } from "../apiService";
import { getJsonItemFromLocalStorage } from "@/lib/utils";

// Type definitions for POS Menu response
export interface POSMenuItem {
  id: string;
  itemName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
}

export interface POSMenu {
  name: string;
  packingCost: number;
  waitingTimeMinutes: number;
  id: string;
  totalCount: number;
  items: POSMenuItem[];
}

export interface POSSection {
  name: string;
  id: string;
  totalCount: number;
  menus: POSMenu[];
}

export interface POSMenuResponse {
  data: POSSection[];
  error: any;
  isSuccessful: boolean;
}

// Fetch POS menu data - following existing codebase pattern
export async function getPOSMenu(businessId?: string, cooperateID?: string) {
  // Get business info if not provided
  if (!businessId) {
    const businesses = getJsonItemFromLocalStorage('business');
    businessId = businesses?.[0]?.businessId || '91c8c8bc-30a0-4d9d-888d-0f7846024e31';
  }

  const headers = businessId ? { businessId, cooperateID } : {};

  try {
    const data = await api.get(DASHBOARD.menuPos, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
    return null;
  }
}

// Add item to order
export const addItemToOrder = (item: POSMenuItem, menuInfo: { packingCost: number; menuName: string }) => {
  return {
    id: item.id,
    name: item.itemName,
    description: item.itemDescription,
    category: menuInfo.menuName,
    price: item.price,
    currency: item.currency,
    packingCost: menuInfo.packingCost,
    quantity: 1,
    isAvailable: item.isAvailable,
    hasVariety: item.hasVariety,
  };
};