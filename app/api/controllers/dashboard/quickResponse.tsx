import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function getQR(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.qr, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
