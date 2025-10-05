const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1`;

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

    return await response.json();
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
  pageSize: number = 21
) => {
  try {
    const url = `${BASE_URL}/Menu/items?MenuId=${menuId}&Page=${page}&PageSize=${pageSize}`;

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
