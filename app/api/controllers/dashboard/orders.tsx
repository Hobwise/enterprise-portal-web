import { z } from "zod";
import { DASHBOARD } from "../../api-url";
import api, { handleError } from "../../apiService";

interface Order {
  placedByName: string;
  placedByPhoneNumber: string;
  quickResponseID?: string;
  comment: string;
  orderDetails: OrderDetail[];
}

interface OrderDetail {
  itemID: string;
  quantity: number;
  unitPrice: number;
  packingCost?: number;
}

export const orderSchema = z.object({
  placedByName: z.string().trim().min(1, "Name is required"),
  placedByPhoneNumber: z
    .string()
    .length(11, "Phone number must be 11 digits long")
    .startsWith("0", "Phone number must start with 0")
    .refine((value) => /^\d+$/.test(value), {
      message: "Phone number must only contain digits",
    }),
  quickResponseID: z.string().trim().min(1, "Select a Table"),
});
export const orderSchemaUser = z.object({
  placedByName: z.string().trim().min(1, "Name is required"),
  placedByPhoneNumber: z
    .string()
    .length(11, "Phone number must be 11 digits long")
    .startsWith("0", "Phone number must start with 0")
    .refine((value) => /^\d+$/.test(value), {
      message: "Phone number must only contain digits",
    }),
});

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
  const headers = businessId ? { businessId } : {};
  const payload = {
    startDate: startDate,
    endDate: endDate,
    filterType: filterType,
    category: category,
    businessId: businessId,
    page: page || 0,
    pageSize: pageSize || 10,
  };


  try {
    const response = await api.post(DASHBOARD.orderItems, payload, {
      headers,
    });



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

export async function getOrder(orderId: string) {
  const headers = { orderId };

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
export async function completeOrder(payload: any, orderId: string) {
  const headers = { orderId };

  try {
    const data = await api.post(DASHBOARD.completeOrder, payload, {
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
  const headers = businessId ? { businessId, cooperateID } : {};

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
  const headers = businessId ? { businessId, cooperateID } : {};

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
