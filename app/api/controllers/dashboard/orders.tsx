import { z } from "zod";
import { DASHBOARD } from "../../api-url";
import api, { handleError } from "../../apiService";

interface Order {
  placedByName: string;
  placedByPhoneNumber: string;
  quickResponseID?: string;
  comment: string;
  status?: number;
  additionalCost?: number;
  additionalCostName?: string;
  totalAmount?: number;
  orderDetails: OrderDetail[];
}

interface OrderDetail {
  itemID: string;
  quantity: number;
  unitPrice: number;
  packingCost?: number;
  isVariety?: boolean;
  isPacked?: boolean;
}

const optionalPhoneSchema = z.string().trim().optional().or(z.literal(""));

export const orderSchema = z.object({
  placedByName: z.string().trim().min(1, "Name is required"),
  placedByPhoneNumber: optionalPhoneSchema,
  quickResponseID: z.string().trim().min(1, "Select a Table"),
});
export const orderSchemaUser = z.object({
  placedByName: z.string().trim().min(1, "Name is required"),
  placedByPhoneNumber: optionalPhoneSchema,
});

// Function to get category order counts for business-activities
export async function getCategoryOrders(
  categoryId: string,
  startDate?: string,
  endDate?: string,
  filterType: number = 0
) {
  try {
    // Only include dates in payload if they are defined
    const payload: any = {
      filterType,
    };

    if (startDate) {
      payload.startDate = startDate;
    }
    if (endDate) {
      payload.endDate = endDate;
    }

    const response = await api.post(
      `/api/v1/Order/categories/${categoryId}`,
      payload
    );

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// Function to get detailed order list for category
export async function getCategoryOrderDetails(
  categoryId: string,
  page: number = 1,
  pageSize: number = 10,
  startDate?: string,
  endDate?: string,
  filterType: number = 0,
  orderStatus?: string
) {
  try {
    // Build payload conditionally to avoid sending undefined values
    const payload: any = {
      filterType,
    };

    // Only add dates if they are defined
    if (startDate) {
      payload.startDate = startDate;
    }
    if (endDate) {
      payload.endDate = endDate;
    }

    // Only add orderStatus if it's defined and not empty
    if (orderStatus) {
      payload.orderStatus = orderStatus;
    }

    const response = await api.post(
      `/api/v1/Order/details/${categoryId}?page=${page}&pageSize=${pageSize}`,
      payload
    );

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// New function to get order categories
export async function getOrderCategories(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload = {
    startDate: startDate,
    endDate: endDate,
    filterType: filterType,
    businessId: businessId,
  };

  try {
    const response = await api.post(DASHBOARD.orderByCategories, payload, {
      headers,
    });

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// New function to get order details
export async function getOrderDetails(
  businessId: string,
  category: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  page?: number,
  pageSize?: number
) {
  // Default to current day if dates are not provided
  const now = new Date();
  const defaultStartDate =
    startDate ||
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    ).toISOString();
  const defaultEndDate =
    endDate ||
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).toISOString();

  // Build URL with query parameters
  const pageParam = page || 1;
  const pageSizeParam = pageSize || 10;
  const url = `${DASHBOARD.orderItems}?page=${pageParam}&pageSize=${pageSizeParam}`;

  const payload = {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    filterType: filterType,
    category: category,
    businessId: businessId,
  };

  try {
    const response = await api.post(url, payload);

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getOrderByBusiness(
  businessId: string,
  page: any,
  rowsPerPage: any,
  tableStatus: any,
  filterType: any,
  startDate?: any,
  endDate?: any
) {
  const headers = businessId ? { businessId } : {};

  const payload = {
    startDate: startDate,
    endDate: endDate,
    filterType: filterType,
    businessId: businessId,
    statusPaginationInfoList: [
      {
        status: tableStatus || "All",
        page: page || 1,
        pageSize: rowsPerPage || 10,
      },
    ],
  };

  try {
    const response = await api.post(DASHBOARD.orderByCategories, payload, {
      headers,
    });

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getOrder(
  orderId: string,
  businessId?: string,
  cooperateId?: string
) {
  const headers: any = { orderId };
  if (businessId) headers.businessId = businessId;
  if (cooperateId) headers.cooperateId = cooperateId;

  try {
    const data = await api.get(DASHBOARD.order, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getOrderByRef(
  reference: string,
  businessId: string,

  cooperateID?: string
) {
  const headers = { reference, businessId, cooperateID };

  try {
    const data = await api.get(DASHBOARD.orderByRef, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function completeOrder(categoryId: string, orderId: string) {
  const url = `${DASHBOARD.completeOrder}?categoryId=${categoryId}`;
  const headers = {
    orderId,
  };

  try {
    const data = await api.post(
      url,
      {},
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function completeOrderWithPayment(payload: any, orderId: string) {
  const url = `${DASHBOARD.completeOrderWithPayment}`;
  const headers = {
    orderId,
  };

  try {
    const data = await api.post(url, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function createOrder(
  businessId: string,
  payload: Order,
  cooperateID?: string
) {
  const validatedFields = orderSchema.safeParse({
    placedByName: payload?.placedByName,
    placedByPhoneNumber: payload?.placedByPhoneNumber,
    quickResponseID: payload?.quickResponseID,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId, cooperateId: cooperateID } : {};

  try {
    const data = await api.post(DASHBOARD.placeOrder, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function createUserOrder(
  businessId: string,
  payload: Order,
  cooperateID?: string
) {
  const validatedFields = orderSchemaUser.safeParse({
    placedByName: payload?.placedByName,
    placedByPhoneNumber: payload?.placedByPhoneNumber,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId, cooperateId: cooperateID } : {};

  try {
    const data = await api.post(DASHBOARD.placeOrder, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function editOrder(orderId: string, payload: Order) {
  const validatedFields = orderSchema.safeParse({
    placedByName: payload?.placedByName,
    placedByPhoneNumber: payload?.placedByPhoneNumber,
    quickResponseID: payload.quickResponseID,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await api.put(
      `${DASHBOARD.order}?orderId=${orderId}`,
      payload
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function editUserOrder(orderId: string, payload: Order) {
  const validatedFields = orderSchemaUser.safeParse({
    placedByName: payload?.placedByName,
    placedByPhoneNumber: payload?.placedByPhoneNumber,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await api.put(
      `${DASHBOARD.order}?orderId=${orderId}`,
      payload
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}

// Function to get active orders for a category
export async function getActiveOrdersByCategory(categoryId: string) {
  try {
    const response = await api.get(
      `/api/v1/Order/categories/${categoryId}/active-orders`
    );

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// Function to get individual order details by category
export async function getOrderDetailsByCategory(
  categoryId: string,
  orderId: string
) {
  try {
    const response = await api.get(
      `/api/v1/Order/categories/${categoryId}/orders/${orderId}`
    );

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// Function to update estimated preparation time
export async function updateEstimatedPreparationTime(
  orderId: string,
  businessId: string,
  additionalTimeInMins: number
) {
  const headers = { businessId };
  const payload = {
    orderId,
    businessId,
    additionalTimeInMins,
  };

  try {
    const response = await api.put(
      `/api/v1/Order/estimated-preparation-time`,
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// Function to get order progress/preparation status
export async function getOrderProgress(orderId: string) {
  try {
    const response = await api.get(`/api/v1/Order/progress/${orderId}`);
    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

// Function to get payment summary
export async function getPaymentSummary(orderId: string) {
  try {
    const response = await api.get(`${DASHBOARD.paymentSummary}/${orderId}`);
    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}

interface RefundPayload {
  refundAmount: number;
  reason: string;
  treatedBy: string;
  treatedById: string;
  paymentReference: string;
  paymentMethod: number;
}

// Function to process refund
export async function refundOrder(payload: RefundPayload, orderId: string) {
  const headers = { orderId };
  try {
    const response = await api.post(DASHBOARD.refundOrder, payload, {
      headers,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// Function to get business order configuration
export async function getBusinessOrderConfiguration(businessId: string) {
  const headers = { businessId };
  try {
    const response = await api.get(`/api/v1/Business/order-configuration`, {
      headers,
    });
    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}
