import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function getPaymentByBusiness(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.paymentByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function confirmPayment(businessId: string, payload: any) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.confirmPayment, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
