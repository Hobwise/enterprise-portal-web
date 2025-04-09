import { LANDINGPAGE } from '../api-url';
import api, { handleError } from '../apiService';

export async function getFAQItems() {
  try {
    const data = await api.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.getFAQs}`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getNews() {
  try {
    const data = await api.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.getNews}?count=6`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getCampaigns() {
  try {
    const data = await api.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.getCampaigns}?count=5`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReservations(
  page: number,
  pageSize: string,
  searchKeyWord: string
) {
  try {
    const data = await api.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.getReservations}?Page=${page}&PageSize=${pageSize}&searchKeyWord=${searchKeyWord}`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function AddToWaitingList(payload: {
  email: string;
  name: string;
}) {
  try {
    const data = await api.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.addToWaitList}`,
      payload
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPricings() {
  try {
    const data = await api.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.getPricing}`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getCompanies() {
  try {
    const data = await api.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.getCompanies}?count=10`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function ContactUs(payload: { email: string; name: string; message: string }) {
  try {
    const data = await api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.contactUs}`, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function BookDemo(payload: { email: string; name: string; notes?: string; preferredDateTime: string; phoneNumber: string }) {
  try {
    const data = await api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.bookDemo}`, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}

interface IBookReservation {
  firstName: string;
  lastName: string;
  emailAddress: string;
  bookingDateTime: string;
  description?: string;
  reservationId: string;
  cooperateId: string;
  businessId: string;
  userId?: string;
}

export async function BookReservationApi(payload: IBookReservation) {
  const { cooperateId, businessId, userId, ...others } = payload;
  try {
    const data = await api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.bookReservation}`, others, {
      headers: { cooperateId, businessId, userId },
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function fetchAvailability(params: { ReservationId: string; RequestDate: string }) {
  try {
    const data = await api.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}${LANDINGPAGE.reservationAvailility}`, { params });
    // const data = await api.get(
    //   `${process.env.NEXT_PUBLIC_API_BASE_URL}v1/Reservation/availability?ReservationId=9fb5ff3e-3c65-4e9f-a33b-8896e7e0f4b2&RequestDate=2025-02-18T10%3A50%3A33.291Z`
    // );

    return data;
  } catch (error) {
    handleError(error);
  }
}

// /api/v1/Reservation/availability?ReservationId=9fb5ff3e-3c65-4e9f-a33b-8896e7e0f4b2&RequestDate=2025-02-18T10%3A50%3A33.291Z
