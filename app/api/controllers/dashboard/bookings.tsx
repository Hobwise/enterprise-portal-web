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
  emailAddress: emailValidation(),
  phoneNumber: z
    .string()
    .length(11, 'Phone number must be 11 digits long')
    .startsWith('0', 'Phone number must start with 0')
    .refine((value) => /^\d+$/.test(value), {
      message: 'Phone number must only contain digits',
    }),
});
export async function createBooking(businessId: any, payload: Bookings) {
  const validatedFields = bookingsSchema.safeParse({
    firstName: payload?.firstName,
    lastName: payload?.lastName,
    emailAddress: payload.emailAddress,
    phoneNumber: payload.phoneNumber,
    // bookingDateTime: payload. bookingDateTime,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.bookings, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
