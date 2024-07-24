import { z } from 'zod';
import { AUTH, DASHBOARD } from '../../api-url';
import api, { handleError } from '../../apiService';
import { businessAddressValidation, emailValidation } from '../validations';

type termsNcondition = {
  content: string;
  isPublished: boolean;
};

const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;

const businessSettingSchema = z.object({
  resistrationNumber: z
    .string()
    .trim()
    .min(1, 'Registration name is required')
    .max(8, 'Registration name should not be more than 8 digits'),
  resistrationCertificateImageReference: z
    .string()
    .trim()
    .min(1, 'Certificate of registration is required'),
  nin: z
    .string()
    .min(1, 'Nin is required')
    .max(11, 'Nin should not be more than 11 numbers'),
  identificationImageReference: z
    .string()
    .trim()
    .min(1, 'Means of identification is required'),
  logoImageReference: z.string().trim().min(1, 'Business logo is required'),
  address: businessAddressValidation(),
  state: z.string().trim().min(1, { message: 'Select a state' }),
  city: z.string().trim().min(1, { message: 'Select a city' }),
  contactEmailAddress: emailValidation(),
  contactPhoneNumber: z
    .string()
    .length(11, 'Phone number must be 11 digits long')
    .startsWith('0', 'Phone number must start with 0')
    .refine((value) => /^\d+$/.test(value), {
      message: 'Phone number must only contain digits',
    }),
  // primaryBrandColour: z
  //   .string()
  //   .trim()
  //   .min(1, 'Primary brand color is required')
  //   .regex(hexColorRegex, 'Invalid hex color code'),
  // secondaryBrandColour: z
  //   .string()
  //   .trim()
  //   .min(1, 'Secondary brand color is required')
  //   .regex(hexColorRegex, 'Invalid hex color code'),
});

export async function getRoleByBusiness(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.getRoleByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateBusiness(formData: any, businessId: string) {
  const validatedFields = businessSettingSchema.safeParse({
    resistrationNumber: formData.resistrationNumber,
    resistrationCertificateImageReference:
      formData.resistrationCertificateImageReference,
    nin: formData.nin,
    identificationImageReference: formData.identificationImageReference,
    logoImageReference: formData.logoImageReference,
    primaryBrandColour: formData.primaryBrandColour,
    address: formData.address,
    state: formData.state,
    city: formData.city,
    contactEmailAddress: formData.contactEmailAddress,
    contactPhoneNumber: formData.contactPhoneNumber,
    // secondaryBrandColour: formData.secondaryBrandColour,
    // logoImageReference: formData.logoImageReference,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.put(AUTH.registerBusiness, formData, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function createTermsAndCondition(
  businessId: string,
  payload: termsNcondition
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(DASHBOARD.termAndCondition, payload, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function getTermsAndCondition(
  businessId: string,
  isAdmin: boolean
) {
  const headers = businessId ? { businessId, isAdmin } : {};

  try {
    const data = await api.get(DASHBOARD.getTermAndCondition, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function getBusinessByBusinessId(businessId: string) {
  const headers = businessId ? { businessId: businessId } : {};

  try {
    const data = await api.get(DASHBOARD.getBusiness, {
      headers,
    });

    return data;
  } catch (error) {}
}

export async function getFile(referenceId: string) {
  const headers = referenceId ? { referenceId } : {};

  try {
    const data = await api.post(
      DASHBOARD.getFile,
      {},
      {
        headers,
      }
    );

    return data;
  } catch (error) {}
}

export async function getBusinesByCooperate(
  businessId: string,
  page: any,
  pageSize: any
) {
  const headers = businessId ? { businessId, page, pageSize } : {};

  try {
    const data = await api.get(DASHBOARD.getBusinessByCooperate, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
