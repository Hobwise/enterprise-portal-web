import { DASHBOARD } from '../../api-url';
import api from '../../apiService';

export async function getDashboardReport(
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
  };

  try {
    const data = await api.post(`${DASHBOARD.dashboard}`, payload, {
      headers,
    });

    return data;
  } catch (error) {
    return error;
    // handleError(error, false);
  }
}
