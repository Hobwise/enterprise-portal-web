import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function getRoleByBusiness(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.getRoleByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
