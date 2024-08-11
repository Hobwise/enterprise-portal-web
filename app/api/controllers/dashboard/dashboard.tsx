import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

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
    const data = await api.post(DASHBOARD.dashboard, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
