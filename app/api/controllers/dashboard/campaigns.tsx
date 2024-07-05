import { z } from 'zod';
import { DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';

export type payloadCampaignItem = {
  campaignName: string;
  campaignDescription: string;
  startDateTime?: string;
  endDateTime?: string;
  dressCode: string;
  isActive: boolean;
  imageReference: string;
};

const camapaignSchema = z.object({
  campaignName: z.string().trim().min(1, 'Reservation name is required'),
  campaignDescription: z
    .string()
    .trim()
    .min(1, 'Reservation description is required'),
  startDateTime: z.string().trim().min(3, 'Campaign start date is required'),
  endDateTime: z.string().trim().min(3, 'Campaign end date is required'),

  dressCode: z.string().trim().min(1, 'Dress code is required'),
});

export async function getCampaigns(
  businessId: string,
  page: any,
  pageSize: any
) {
  const headers = businessId ? { businessId, page, pageSize } : {};

  try {
    const data = await api.get(DASHBOARD.campaignsByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function createCampaign(
  businessId: string,
  payload: payloadCampaignItem
) {
  const validatedFields = camapaignSchema.safeParse({
    campaignName: payload?.campaignName,
    campaignDescription: payload?.campaignDescription,
    startDateTime: payload?.startDateTime,
    endDateTime: payload?.endDateTime,
    dressCode: payload?.dressCode,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.campaigns, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function removeCampaign(businessId: string, campaignId: string) {
  const headers = businessId ? { businessId, campaignId } : {};
  try {
    const data = await api.delete(DASHBOARD.campaigns, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getCampaign(campaignId: string, businessId: string) {
  const headers = businessId ? { businessId, campaignId } : {};

  try {
    const data = await api.get(DASHBOARD.campaigns, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
