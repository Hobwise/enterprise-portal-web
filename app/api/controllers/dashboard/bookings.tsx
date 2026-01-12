import { z } from "zod";
import { DASHBOARD } from "../../api-url";
import api, { handleError } from "../../apiService";
import { emailValidation, inputNameValidation } from "../validations";

interface Bookings {
  reservationId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  bookingDateTime: string;
}

export const bookingsSchema = z.object({
  firstName: inputNameValidation("First name"),
  lastName: inputNameValidation("Last name"),
  reservationId: z.string().trim().min(1, "Select a reservation"),
  emailAddress: emailValidation(),
  phoneNumber: z
    .string()
    .length(11, "Phone number must be 11 digits long")
    .refine((value) => /^\d+$/.test(value), {
      message: "Phone number must only contain digits",
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
export async function updateBooking(
  businessId: any,
  payload: Bookings,
  cooperateID: null,
  UserId: string,
  bookingId: string
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
  const headers = businessId
    ? { businessId, cooperateID, UserId, bookingId }
    : {};

  try {
    const data = await api.put(DASHBOARD.bookings, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getBookingCategories(
  businessId: string,
  // filterType: number,
  // startDate?: string,
  // endDate?: string
) {
  const headers = businessId ? { businessId } : {};
  const payload = {
    businessId: businessId,

  };

  try {
    const data = await api.get(DASHBOARD.bookingsByBusiness, {
      params: payload,
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getBookingDetails(
  businessId: string,
  category: string,
  page?: number,
  pageSize?: number
) {
  const headers = businessId ? { businessId } : {};
  const payload = {
    category: category,
    businessId: businessId,
    page: page || 0,
    pageSize: pageSize || 10,
  };

  try {
    const response = await api.post(DASHBOARD.bookingsByDetails, payload, {
      headers,
    });
    return response.data;


  } catch (error) {
    handleError(error, false);
  }
}


// export async function getBookings(
//   businessId: string,
//   page: any,
//   rowsPerPage: any,
//   tableStatus: any,
// ) {
//   const headers = businessId ? { businessId } : {};

//   const payload = {
//     // filterType: filterType,
//     businessId: businessId,
//     statusPaginationInfoList: [
//       {
//         status: tableStatus || "All",
//         page: page || 1ame,
//         pageSize: rowsPerPage || 10,
//       },
//     ],
//   };

//   try {
//     const data = await api.get(DASHBOARD.bookingsByBusiness, payload, {
//       headers,
//     });

//     return data;
//   } catch (error) {
//     handleError(error, false);
//   }
// }

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
    return error;
    // handleError(error, false);
  }
}
