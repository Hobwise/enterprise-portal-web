import { LANDINGPAGE } from '../api-url';
import api, { handleError } from '../apiService';

export async function getFAQItems() {
  try {
    const data = await api.get(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.getFAQs}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getNews() {
  try {
    const data = await api.get(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.getNews}?count=6`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getCampaigns() {
  try {
    const data = await api.get(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.getCampaigns}?count=5`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getReservations(page: number, pageSize: string, searchKeyWord: string) {
  try {
    const data = await api.get(
      `https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.getReservations}?Page=${page}&PageSize=${pageSize}&searchKeyWord=${searchKeyWord}`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function AddToWaitingList(payload: { email: string; name: string }) {
  try {
    const data = await api.post(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.addToWaitList}`, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPricings() {
  try {
    const data = await api.get(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.getPricing}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getCompanies() {
  try {
    const data = await api.get(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.getCompanies}?count=10`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function ContactUs(payload: { email: string; name: string; message: string }) {
  try {
    const data = await api.post(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.contactUs}`, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function BookDemo(payload: { email: string; name: string; notes?: string; preferredDateTime: string; phoneNumber: string }) {
  try {
    const data = await api.post(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.bookDemo}`, payload);

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
    const data = await api.post(`https://walrus-app-lehim.ondigitalocean.app/${LANDINGPAGE.bookReservation}`, others, {
      headers: { cooperateId, businessId, userId },
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
