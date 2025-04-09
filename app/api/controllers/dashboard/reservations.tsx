import { z } from "zod";
import { DASHBOARD } from "../../api-url";
import api, { handleError } from "../../apiService";
import axios from "axios";

export type payloadReservationItem = {
  reservationName: string;
  reservationDescription: string;
  reservationFee: number;
  minimumSpend: number;
  reservationDuration?: any;
  allowSystemAdvert?: boolean;
  reservationRequirement?: number;
  quantity: number;
  numberOfSeat: number;
  imageReference: string;
  startTime: string;
  endTime: string;
};

// api/v1/Reservation?ReservationId=9fb5ff3e-3c65-4e9f-a33b-8896e7e0f4b2&RequestDate=2025-02-19T10%3A22%3A59.9797627

const reservationSchema = z
  .object({
    reservationName: z.string().trim().min(1, "Reservation name is required"),
    reservationDescription: z
      .string()
      .trim()
      .min(1, "Reservation description is required"),
    // reservationFee: z.number().min(1, 'Reservation fee is required'),
    // minimumSpend: z.number().min(1, 'Minimum spend is required'),
    quantity: z.number().min(1, "Quantity is required"),
    // reservationRequirement: z.string().trim().min(1, 'Requirement is required'),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"), // HH:MM
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
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
    startTime: payload.startTime,
    endTime: payload.endTime,
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
      status: tableStatus || "All",
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

export const getSingleReservationDetails = async (
  reservationId: string
): Promise<any> =>
  await api.get(DASHBOARD.singleBookings, { params: { reservationId } });

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
    startTime: payload?.startTime,
    endTime: payload?.endTime,
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

export async function getReservationsByDate(
  reservationId: string,
  requestDate: string
) {
  // Construct the API URL dynamically
  const url = `${
    DASHBOARD.reservation
  }?ReservationId=${reservationId}&RequestDate=${encodeURIComponent(
    requestDate
  )}`;

  // Set headers if businessId is provided

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error, false);
    return null;
  }
}
