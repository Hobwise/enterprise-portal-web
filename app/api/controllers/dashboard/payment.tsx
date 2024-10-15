import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function getPaymentByBusiness(
  businessId: string,
  page: any,
  rowsPerPage: any,
  tableStatus: any
) {
  const headers = businessId ? { businessId } : {};

  const payload = [
    {
      status: tableStatus || 'All',
      page: page || 1,
      pageSize: rowsPerPage || 10,
    },
  ];

  try {
    const data = await api.post(DASHBOARD.paymentByBusiness, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
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
