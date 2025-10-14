import { z } from "zod";
import { AUTH, DASHBOARD } from "../../api-url";
import api, { handleError } from "../../apiService";
import { businessAddressValidation, emailValidation } from "../validations";
import axios from "axios";
import { notify } from "@/lib/utils";
type termsNcondition = {
  content: string;
  isPublished: boolean;
};

const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;

const businessSettingSchema = z.object({
  resistrationNumber: z
    .string()
    .trim()
    .min(1, "Registration name is required")
    .max(8, "Registration name should not be more than 8 digits"),
  resistrationCertificateImageReference: z
    .string()
    .trim()
    .min(1, "Certificate of registration is required"),
  nin: z
    .string()
    .min(1, "Nin is required")
    .max(11, "Nin should not be more than 11 numbers"),
  identificationImageReference: z
    .string()
    .trim()
    .min(1, "Means of identification is required"),
  logoImageReference: z.string().trim().min(1, "Business logo is required"),
  address: businessAddressValidation(),
  state: z.string().trim().min(1, { message: "Select a state" }),
  city: z.string().trim().min(1, { message: "Select a city" }),
  contactEmailAddress: emailValidation(),
  contactPhoneNumber: z
    .string()
    .length(11, "Phone number must be 11 digits long")
    .refine((value) => /^\d+$/.test(value), {
      message: "Phone number must only contain digits",
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
    const data = await api.get(DASHBOARD.getRoleByBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
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
  isAdmin: boolean,
  cooperateId?: any
) {
  const headers = businessId ? { cooperateId, businessId, isAdmin } : {};

  try {
    const data = await api.get(DASHBOARD.getTermAndCondition, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getNotificationCount(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.notificationCount, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function postMarkAsRead(notificationId: string) {
  const headers = notificationId ? { notificationId } : {};

  try {
    const data = await api.post(
      DASHBOARD.markAsRead,
      {},
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function postMarkAllAsRead(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.post(
      DASHBOARD.markAllAsRead,
      {},
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getNotification(
  businessId: string,
  page: number,
  pageSize: number
) {
  const headers = businessId ? { businessId } : {};
  const payload = {
    page: page,
    pageSize: pageSize,
  };

  try {
    const data = await api.post(DASHBOARD.notifications, payload, {
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
  } catch (error) {
    handleError(error, false);
  }
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

export async function getBusinesByCooperate(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.getBusinessByCooperate, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function configureRole(businessId: string, payload: any) {
  const headers = businessId ? { businessId: businessId } : {};

  try {
    const data = await api.post(DASHBOARD.configureRole, payload, {
      headers,
    });

    return data;
  } catch (error) {}
}

export async function initializeTransaction(businessId: string, payload: any) {
  const headers = businessId ? { businessId: businessId } : {};

  console.log("FROM", businessId, payload);
  // console.log("TO", headers);
  try {
    const data = await api.post(DASHBOARD.intializeTransaction, payload, {
      headers,
    });

    return data;
  } catch (error) {
    console.log("ERROR", error);
  }
}

export async function initializeTransactionv2(
  businessId: string,
  payload: any,
  token: string
) {
  // const headers = businessId ? { businessId: businessId } : {};

  const body = JSON.stringify(payload);

  var config = {
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/Transaction/initialise-subscription`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Businessid: businessId,
    },
    data: body,
  };

  return axios(config)
    .then((response) => {
      return response?.data?.data?.data;
    })
    .catch((error) => {
      if (error.status === 400) {
        notify({
          title: "Error",
          text: error.response.data.error.responseDescription,
          type: "error",
        });
      } else {
        notify({
          title: "Error",
          text: "An error occurred during transaction initialization",
          type: "error",
        });
      }
    });
}

export async function getSubscription(
  businessId: string,
  page: any,
  pageSize: any
) {
  const headers = businessId ? { businessId, page, pageSize } : {};

  try {
    const data = await api.get(DASHBOARD.subscription, {
      headers,
    });

    // console.log("SUCCESS", data)
    return data;
  } catch (error) {
    console.log("ERROR", error);
    handleError(error, false);
  }
}
export async function getUserSubscription(businessId: string) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(DASHBOARD.userSubscription, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function manageSubscription(businessId: string) {
  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.post(DASHBOARD.manage, {
      headers,
    });

    // console.log("SUCCESS", data)
    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function manageSubscriptionv2(businessId: string, token: string) {
  // const headers = businessId ? { businessId: businessId } : {};

  // const body = JSON.stringify(payload);

  var config = {
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/Subscription/manage-link`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Businessid: businessId,
    },
    // data: body,
  };

  return axios(config)
    .then((response) => {
      // console.log(response)
      return response?.data;
    })
    .catch((error) => {
      console.log("ERROR", error);
    });
}

export async function logout() {
  try {
    const data = await api.post(AUTH.logout, {});

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
