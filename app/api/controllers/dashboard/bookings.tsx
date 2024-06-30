import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';
import { emailValidation, inputNameValidation } from '../validations';

interface Bookings {
  reservationId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  bookingDateTime: string;
}

export const bookingsSchema = z.object({
  firstName: inputNameValidation('First name'),
  lastName: inputNameValidation('Last name'),
  reservationId: z.string().trim().min(1, 'Select a reservation'),
  emailAddress: emailValidation(),
  phoneNumber: z
    .string()
    .length(11, 'Phone number must be 11 digits long')
    .startsWith('0', 'Phone number must start with 0')
    .refine((value) => /^\d+$/.test(value), {
      message: 'Phone number must only contain digits',
    }),
});
export async function createBooking(
  businessId: any,
  payload: Bookings,
  cooperateID: null
) {
  const validatedFields = bookingsSchema.safeParse({
    firstName: payload?.firstName,
    lastName: payload?.lastName,
    emailAddress: payload.emailAddress,
    phoneNumber: payload.phoneNumber,
    reservationId: payload.reservationId,
    // bookingDateTime: payload. bookingDateTime,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId, cooperateID } : {};

  try {
    const data = await api.post(DASHBOARD.bookings, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getBookingsByBusiness(
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
    const data = await api.post(DASHBOARD.bookingsByBusiness, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getBookingByRef(
  businessId: string,
  bookingReferenceId: string
) {
  const headers = businessId ? { businessId, bookingReferenceId } : {};

  try {
    const data = await api.get(DASHBOARD.bookingsByRef, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function postBookingStatus(bookingId: string, status: number) {
  const headers = { status, bookingId };

  try {
    const data = await api.post(
      DASHBOARD.updateStatus,
      {},
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
