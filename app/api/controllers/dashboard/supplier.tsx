import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export type SupplierPayload = {
  name: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  physicalAddress: string;
  isActive: boolean;
};


export async function createSupplier(businessId: string, payload: SupplierPayload) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.supplier, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}


export async function getSuppliersByBusiness(businessId: string, clientParameters: any) {
  const headers = businessId ? { businessId, clientParameters: JSON.stringify(clientParameters) } : {};

  try {
    const data = await api.get(DASHBOARD.supplierByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getSupplier(supplierId: string) {
  const headers = supplierId ? { supplierId } : {};

  try {
    const data = await api.get(DASHBOARD.supplier, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}


export async function updateSupplier(businessId: string, supplierId: string, payload: SupplierPayload) {
  const headers: Record<string, string> = {};
  if (businessId) headers.businessId = businessId;
  if (supplierId) headers.supplierId = supplierId;

  try {
    const data = await api.put(DASHBOARD.supplier, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteSupplier(supplierId: string) {
  const headers = supplierId ? { supplierId } : {};

  try {
    const data = await api.delete(DASHBOARD.supplier, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function mapSupplierItems(businessId: string, supplierId: string, items: { id: string, name: string }[]) {
  const headers = businessId ? { businessId, supplierId } : {};

  try {
    const data = await api.post(DASHBOARD.mapSupplierItem, items, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
