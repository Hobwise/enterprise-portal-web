import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

const withDateRange = (
  payload: Record<string, unknown>,
  startDate?: string,
  endDate?: string
): Record<string, unknown> => {
  if (startDate) payload.startDate = startDate;
  if (endDate) payload.endDate = endDate;
  return payload;
};

export async function getReport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload = withDateRange(
    { filterType: filterType },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.report, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReportOrder(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  emailAddress?: string,
  paymentMethod?: number,
  status?: number
) {
  const headers = businessId ? { businessId } : {};
  const payload: Record<string, unknown> = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );
  if (paymentMethod !== undefined) payload.paymentMethod = paymentMethod;
  if (status !== undefined) payload.status = status;

  try {
    const data = await api.post(DASHBOARD.reportOrder, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReportOrderExport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  exportType?: number,
  emailAddress?: string
) {
  const headers = businessId ? { businessId, exportType } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportOrderExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReportBookingExport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  exportType?: number,
  emailAddress?: string
) {
  const headers = businessId ? { businessId, exportType } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportBookingExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReportPaymentExport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  exportType?: number,
  emailAddress?: string
) {
  const headers = businessId ? { businessId, exportType } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportPaymentExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReportAuditLogExport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  exportType?: number,
  emailAddress?: string
) {
  const headers = businessId ? { businessId, exportType } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportAuditLogExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReportPayment(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  emailAddress?: string,
  paymentMethod?: number,
  status?: number
) {
  const headers = businessId ? { businessId } : {};
  const payload: Record<string, unknown> = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );
  if (paymentMethod !== undefined) payload.paymentMethod = paymentMethod;
  if (status !== undefined) payload.status = status;

  try {
    const data = await api.post(DASHBOARD.reportPayment, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReportBooking(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  emailAddress?: string,
  bookingStatus?: number
) {
  const headers = businessId ? { businessId } : {};
  const payload: Record<string, unknown> = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );
  if (bookingStatus !== undefined) payload.bookingStatus = bookingStatus;

  try {
    const data = await api.post(DASHBOARD.reportBooking, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReportAuditLog(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  emailAddress?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      emailAddress: emailAddress,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportAuditLog, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReportInventory(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  inventoryItemId?: string,
  categoryId?: string,
  supplierId?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      inventoryItemId: inventoryItemId,
      categoryId: categoryId,
      supplierId: supplierId,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportInventory, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReportQr(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  quickResponseID?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload: Record<string, unknown> = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
    },
    startDate,
    endDate
  );
  if (quickResponseID !== undefined) payload.quickResponseID = quickResponseID;

  try {
    const data = await api.post(DASHBOARD.reportQr, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReportQrExport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  exportType?: number,
  quickResponseID?: string
) {
  const headers = businessId ? { businessId, exportType } : {};
  const payload: Record<string, unknown> = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
    },
    startDate,
    endDate
  );
  if (quickResponseID !== undefined) payload.quickResponseID = quickResponseID;

  try {
    const data = await api.post(DASHBOARD.reportQrExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReportInventoryExport(
  businessId: string,
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  exportType?: number,
  inventoryItemId?: string,
  categoryId?: string,
  supplierId?: string
) {
  const headers = businessId ? { businessId, exportType } : {};
  const payload = withDateRange(
    {
      filterType: filterType,
      reportType: reportType,
      inventoryItemId: inventoryItemId,
      categoryId: categoryId,
      supplierId: supplierId,
    },
    startDate,
    endDate
  );

  try {
    const data = await api.post(DASHBOARD.reportInventoryExport, payload, {
      headers,
      responseType: 'blob',
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
