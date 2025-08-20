import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

const menuItemSchema = z.object({
  itemName: z.string().trim().min(1, 'Item name is required'),
  price: z.number().min(1, 'Price is required'),
  menuID: z.string().trim().min(1, 'Select a menu'),
});
const menuVarietySchema = z.object({
  unit: z.string().trim().min(1, 'Unit is required'),
  price: z.number().min(1, 'Price is required'),
});
export async function getMenu(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.getMenu, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getMenuItem(menuId: string) {
  try {
    const data = await api.get(`${DASHBOARD.menuItem}?itemId=${menuId}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function uploadFile(businessId: string, formData: FormData) {
  const headers = businessId
    ? { businessId, 'Content-Type': 'multipart/form-data' }
    : {};
  try {
    const data = await api.post(DASHBOARD.uploadFile, formData, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function deleteFile(businessId: string, referenceId: string) {
  const headers = businessId ? { businessId, referenceId } : {};
  try {
    const data = await api.delete(DASHBOARD.removeFile, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function uploadFilemultipleMenuItem(
  businessId: string,
  formData: FormData,
  menuId: string
) {
  const headers = businessId
    ? { businessId, menuId, 'Content-Type': 'multipart/form-data' }
    : {};
  try {
    const data = await api.post(DASHBOARD.uploadBulkMenuItem, formData, {
      headers,
    });

    return data;
  } catch (error) {
    return (error as any).response;
  }
}
export async function getMenuByBusiness(
  businessId: string,
  page: any,
  rowsPerPage: any,
  menuIdTable: any,
  cooperateID?: string
) {
  const headers = businessId ? { businessId, cooperateID } : {};

  const payload = [
    {
      menuId: menuIdTable || '',
      page: page || 1,
      pageSize: rowsPerPage || 10,
    },
  ];
  try {
    const data = await api.post(DASHBOARD.getMenuByBusiness, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getMenuByBusinessUser(
  businessId: string,

  cooperateID?: string
) {
  const headers = businessId ? { businessId, cooperateID } : {};

  try {
    const data = await api.post(
      DASHBOARD.menuByUserBusiness,
      {},
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

type payloadMenu = {
  name: string;
  packingCost?: number;
  waitingTimeMinutes?: number;
};
export async function createMenu(businessId: string, payload: payloadMenu) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.getMenu, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function updateMenu(
  businessId: string,
  menuId: string,
  payload: payloadMenu
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.put(
      DASHBOARD.getMenu + `?menuId=${menuId}`,
      payload,
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function createMenuConfiguration(
  businessId: string,
  payload: any
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.menuConfiguration, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function getMenuConfiguration(
  businessId: string,
  cooperateID?: string
) {
  const headers = businessId ? { businessId, cooperateID } : {};

  try {
    const data = await api.get(DASHBOARD.menuConfiguration, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export type payloadMenuItem = {
  menuID: string;
  itemName: string;
  itemDescription: string;
  price: number;
  isAvailable?: boolean;
  imageReference: string;
};
export type payloadMenuVariety = {
  price: number;
  unit: string;
  itemID?: string;
  menuID?: string;

  currency?: string;
};
export async function createMenuItem(
  businessId: string,
  payload: payloadMenuItem
) {
  const validatedFields = menuItemSchema.safeParse({
    itemName: payload?.itemName,
    price: payload?.price,
    menuID: payload.menuID,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.menuItem, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function createMenuVariety(
  businessId: string,
  payload: payloadMenuVariety
) {
  const validatedFields = menuVarietySchema.safeParse({
    price: payload?.price,
    unit: payload?.unit,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.menuVariety, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function editMenuVariety(
  businessId: string,
  payload: payloadMenuVariety,
  varietyId: string
) {
  const validatedFields = menuVarietySchema.safeParse({
    price: payload?.price,
    unit: payload?.unit,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.put(
      `${DASHBOARD.menuVariety}?itemVarietyId=${varietyId}`,
      payload,
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function deleteMenuItem(businessId: string, itemId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.delete(`${DASHBOARD.menuItem}?itemId=${itemId}`, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function deleteVariety(businessId: string, itemId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.delete(
      `${DASHBOARD.menuVariety}?itemVarietyId=${itemId}`,
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function deleteMenu(businessId: string, menuId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.delete(`${DASHBOARD.getMenu}?menuId=${menuId}`, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function editMenuItem(
  businessId: string,
  payload: payloadMenuItem,
  itemId: string
) {
  const validatedFields = menuItemSchema.safeParse({
    itemName: payload?.itemName,
    price: payload?.price,
    menuID: payload.menuID,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.put(
      `${DASHBOARD.menuItem}?itemId=${itemId}`,
      payload,
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function exportGrid(
  businessId: string,
  gridReportType: number,
  filterType?: number,
  startDate?: string,
  endDate?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload = {
    startDate: startDate,
    endDate: endDate,
    filterType: filterType || 4,
    gridReportType: gridReportType,
  };

  try {
    const data = await api.post(DASHBOARD.reportGridExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getMenuCategories(businessId: string, cooperateId: string) {
  const headers = businessId ? { businessId, cooperateId } : {};

  try {
    const data = await api.get(DASHBOARD.menuCategories, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getMenuItems(menuId: string, page: number, pageSize: number) {
  try {
    const data = await api.get(`${DASHBOARD.menuItems}?MenuId=${menuId}&Page=${page}&PageSize=${pageSize}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getMenuVariety(itemId: string) {
  try {
    const data = await api.get(`${DASHBOARD.menuVariety}?itemId=${itemId}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
