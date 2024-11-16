import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export type payloadReservationItem = {
  reservationName: string;
  reservationDescription: string;
  reservationFee: number;
  minimumSpend: number;
  reservationDuration?: any;
  allowSystemAdvert?: boolean;
  reservationRequirement?: number;
  quantity: number;
  imageReference: string;
};

const reservationSchema = z.object({
  reservationName: z.string().trim().min(1, 'Reservation name is required'),
  reservationDescription: z
    .string()
    .trim()
    .min(1, 'Reservation description is required'),
  // reservationFee: z.number().min(1, 'Reservation fee is required'),
  // minimumSpend: z.number().min(1, 'Minimum spend is required'),
  quantity: z.number().min(1, 'Quantity is required'),
  // reservationRequirement: z.string().trim().min(1, 'Requirement is required'),
});

export async function getReservations(
  businessId: string,
  page: any,
  pageSize: any,
  cooperateId?: any
) {
  const headers = businessId ? { cooperateId, businessId, page, pageSize } : {};

  try {
    const data = await api.get(DASHBOARD.reservationsByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getReservationsUser(
  businessId: string,
  cooperateId?: any
) {
  const headers = businessId ? { cooperateId, businessId } : {};

  try {
    const data = await api.get(DASHBOARD.reservationsByBusinessUser, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function createReservations(
  businessId: string,
  payload: payloadReservationItem
) {
  const validatedFields = reservationSchema.safeParse({
    reservationName: payload?.reservationName,
    reservationDescription: payload?.reservationDescription,

    quantity: payload.quantity,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.reservation, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getReservation(
  reservationId: string,
  page: any,
  rowsPerPage: any,
  tableStatus: any
) {
  const payload = [
    {
      status: tableStatus || 'All',
      page: page || 1,
      pageSize: rowsPerPage || 10,
    },
  ];
  const headers = reservationId ? { reservationId } : {};
  try {
    const data = await api.post(DASHBOARD.singleReservation, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function deleteReservation(reservationId: string) {
  const headers = reservationId ? { reservationId } : {};
  try {
    const data = await api.delete(DASHBOARD.reservation, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function editReservations(
  businessId: string,
  payload: payloadReservationItem,
  reservationId: string
) {
  const validatedFields = reservationSchema.safeParse({
    reservationName: payload?.reservationName,
    reservationDescription: payload?.reservationDescription,

    quantity: payload.quantity,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId, reservationId } : {};

  try {
    const data = await api.put(DASHBOARD.reservation, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
