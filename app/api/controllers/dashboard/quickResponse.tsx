import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

type payloadQr = {
  name: string;
};
export async function getQR(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.qrByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function createQr(businessId: string, payload: payloadQr) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.qr, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function updateQr(
  businessId: string,
  qrId: string,
  payload: payloadQr
) {
  const headers = businessId ? { businessId, qrId } : {};

  try {
    const data = await api.put(DASHBOARD.qr, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function removeQR(businessId: string, qrId: string) {
  const headers = businessId ? { businessId, qrId } : {};
  try {
    const data = await api.delete(DASHBOARD.qr, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
