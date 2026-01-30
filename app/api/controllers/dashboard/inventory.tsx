import { INVENTORY } from '../../api-url';
import api, { handleError } from '../../apiService';

export async function getInventoryItems(businessId: string, clientParameters: any) {
  const headers = businessId ? { businessId, clientParameters: JSON.stringify(clientParameters) } : {};

  try {
    const data = await api.get(INVENTORY.inventoryByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
