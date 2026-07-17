// Type-only: keeps the authenticated apiService (and its 401 logout redirect)
// out of this customer-facing, no-auth module.
import type { CheckoutData } from "./dashboard/qrPayment";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1`;

/**
 * Builds the customer-facing checkout view for an order, from data the public
 * by-reference endpoint already returns (no auth required).
 *
 * Totals come straight from the server rather than being recomputed: VAT is
 * per-item and that metadata isn't on the order response, so recomputing here
 * would risk showing the customer a figure the backend never charged.
 *
 * `bankAccounts` is intentionally empty — there is no public endpoint for a
 * business' settlement accounts, and the authenticated one would log the
 * customer out. The UI hides the section until real accounts are available.
 */
export const getCustomerCheckout = async (
  reference: string,
  businessId: string,
  cooperateId?: string
): Promise<CheckoutData | null> => {
  const response = await getCustomerOrderByReference(
    reference,
    businessId,
    cooperateId
  );

  const order = response?.data ?? response;
  if (!order?.orderDetails) return null;

  const grandTotal = order.totalAmount ?? 0;
  const tax = order.vatAmount ?? 0;

  return {
    businessName: order.businessName ?? "",
    reference: order.reference ?? reference,
    orderId: order.id ?? order.orderDetails?.[0]?.orderID,
    items: (order.orderDetails ?? []).map((item: any) => ({
      name: item.itemName,
      quantity: item.quantity,
      price: (item.unitPrice ?? 0) * (item.quantity ?? 0),
    })),
    total: grandTotal - tax,
    tax,
    grandTotal,
    bankAccounts: [],
    qrValue:
      typeof window !== "undefined"
        ? window.location.href
        : `checkout/${reference}`,
  };
};

/**
 * Get menu categories for customer (no auth required)
 */
export const getCustomerMenuCategories = async (
  businessId: string,
  cooperateID?: string
) => {
  try {
    const url = `${BASE_URL}/Menu/categories`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      businessId: businessId,
    };

    if (cooperateID) {
      headers["cooperateId"] = cooperateID;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const responseData = await response.json();
    console.log('[/api/v1/Menu/categories] Endpoint Response:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error("Error fetching customer menu categories:", error);
    throw error;
  }
};

/**
 * Get menu items for customer (no auth required)
 */
export const getCustomerMenuItems = async (
  menuId: string,
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
) => {
  try {
    let url = `${BASE_URL}/Menu/items?MenuId=${menuId}&Page=${page}&PageSize=${pageSize}`;

    // Add SearchTerm parameter if provided
    if (searchTerm && searchTerm.trim() !== "") {
      url += `&SearchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Error fetching customer menu items:", error);
    throw error;
  }
};

/**
 * Get order by reference (no auth required)
 */
export const getCustomerOrderByReference = async (
  reference: string,
  businessId: string,
  cooperateId?: string
) => {
  try {
    const url = `${BASE_URL}/Order/by-reference`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      reference: reference,
      businessId: businessId,
    };

    if (cooperateId) {
      headers["cooperateId"] = cooperateId;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    return await response.json();
  } catch (error) {
    console.error("Error fetching customer order:", error);
    throw error;
  }
};

/**
 * Place order for customer (no auth required)
 */
export const placeCustomerOrder = async (
  payload: {
    status: number;
    placedByName: string;
    placedByPhoneNumber: string;
    quickResponseID: string;
    comment?: string;
    totalAmount: number;
    orderDetails: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
      isVariety?: boolean;
      isPacked?: boolean;
      packingCost?: number;
      comment?: string;
    }>;
  },
  businessId?: string,
  cooperateId?: string
) => {
  try {
    const url = `${BASE_URL}/Order/place`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (businessId) {
      headers["BusinessId"] = businessId;
    }

    if (cooperateId) {
      headers["CooperateId"] = cooperateId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("Error placing customer order:", error);
    throw error;
  }
};

/**
 * Update order for customer (no auth required)
 */
export const updateCustomerOrder = async (
  orderId: string,
  payload: {
    status: number;
    placedByName: string;
    placedByPhoneNumber: string;
    quickResponseID: string;
    comment?: string;
    totalAmount: number;
    orderDetails: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
      isVariety?: boolean;
      isPacked?: boolean;
      packingCost?: number;
      comment?: string;
    }>;
  }
) => {
  try {
    const url = `${BASE_URL}/Order?orderId=${orderId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating customer order:", error);
    throw error;
  }
};

/**
 * Initialize payment for customer checkout (no auth required)
 */
export const initializeCustomerPayment = async (
  businessId: string,
  payload: {
    orderId: string;
    customerEmail: string;
    amountKobo: number;
  },
  userId?: string
) => {
  try {
    const url = `${BASE_URL}/QrPayment/initialize`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (businessId) headers["businessId"] = businessId;
    if (userId) headers["userId"] = userId;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    // Guard against empty / non-JSON bodies (e.g. 204 No Content)
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    if (!text) return null;
    if (!contentType.includes("json")) {
      console.warn("initializeCustomerPayment: unexpected content-type", contentType, text);
      return null;
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error initializing customer payment:", error);
    throw error;
  }
};
