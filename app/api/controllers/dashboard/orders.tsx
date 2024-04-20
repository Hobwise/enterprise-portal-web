import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

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
