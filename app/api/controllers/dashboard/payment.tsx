import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function getPaymentByBusiness(
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
        status: tableStatus || 'All',
        page: page || 1,
        pageSize: rowsPerPage || 10,
      },
    ],
  };

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

export async function getPaymentDetails(
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
    const response = await api.post(DASHBOARD.paymentByDetail, payload, {
      headers,
    });
    return response.data;
  } catch (error) {
    handleError(error, false);
  }
}
