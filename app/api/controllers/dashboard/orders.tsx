import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

interface Order {
  placedByName: string;
  placedByPhoneNumber: string;
  quickResponseID: string;
  comment: string;
  orderDetails: OrderDetail[];
}

interface OrderDetail {
  itemID: string;
  quantity: number;
  unitPrice: number;
}

export const orderSchema = z.object({
  placedByName: z.string().trim().min(1, 'Name is required'),
  placedByPhoneNumber: z
    .string()
    .length(11, 'Phone number must be 11 digits long')
    .startsWith('0', 'Phone number must start with 0')
    .refine((value) => /^\d+$/.test(value), {
      message: 'Phone number must only contain digits',
    }),
  quickResponseID: z.string().trim().min(1, 'Select a Table'),
});
export async function getOrderByBusiness(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.orderByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
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
    handleError(error);
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

export async function createOrder(businessId: string, payload: Order) {
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
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.placeOrder, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
