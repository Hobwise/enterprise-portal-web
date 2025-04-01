import { z } from "zod";
import { AUTH } from "../api-url";
import api, { handleError } from "../apiService";
import {
  businessAddressValidation,
  businessNameValidation,
  emailValidation,
  inputNameValidation,
  passwordValidation,
} from "./validations";
import { decryptPayload, encryptPayload } from "@/lib/encrypt-decrypt";

const userSchema = z
  .object({
    firstName: inputNameValidation("First name"),
    lastName: inputNameValidation("Last name"),
    email: emailValidation(),
    password: passwordValidation(),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: "Enter your password" }),
  })
  .refine((data) => data.password === data?.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"],
  });
const updateUserSchema = z.object({
  firstName: inputNameValidation("First name"),
  lastName: inputNameValidation("Last name"),
  email: emailValidation(),
  // role: z.string().trim().min(1, 'Select a role'),
  phoneNumber: z.string().min(1, "Phone number is required"),
  userName: inputNameValidation("User name"),
  gender: z.string().trim().min(1, "Select a gender"),
});
const additionalUserSchema = z.object({
  firstName: inputNameValidation("First name"),
  lastName: inputNameValidation("Last name"),
  email: emailValidation(),
  role: z.number().min(0, "Select a role"),
  password: passwordValidation(),
});

const loginSchema = z.object({
  email: emailValidation(),
  password: z.string().trim().min(1, { message: "Password field is required" }),
});
const forgetPasswordSchema = z.object({
  email: emailValidation(),
});
const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(1, { message: "Enter your old password" }),
    newPassword: passwordValidation(),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: "Enter your new password" }),
  })
  .refine((data) => data.newPassword === data?.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"],
  });
const businessSchema = z.object({
  name: businessNameValidation(),
  address: businessAddressValidation(),
  businessCategory: z
    .number()
    .min(1, { message: "Please select your business category" }),
  state: z.string().trim().min(1, { message: "Select a state" }),
  city: z.string().trim().min(1, { message: "Select a city" }),
  contactEmailAddress: emailValidation(),
  // contactPhoneNumber: z
  //   .string()
  //   .length(11, 'Phone number must be 11 digits long')
  //   .startsWith('0', 'Phone number must start with 0')
  //   .refine((value) => /^\d+$/.test(value), {
  //     message: 'Phone number must only contain digits',
  //   }),
});

export async function getUserByBusiness(
  businessId: string,
  page: any,
  pageSize: any,
  cooperateId: string
) {
  const headers = businessId ? { businessId } : {};

  try {
    const data = await api.get(
      `${AUTH.userByBusiness}?Page=${page}&PageSize=${pageSize}&cooperateId=${cooperateId}&businessId=${businessId}`,
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}

export async function createUser(formData: any) {
  const validatedFields = userSchema.safeParse({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const payload = {
    email: formData.email,
    purpose: 0,
  };

  try {
    const data = await api.post(AUTH.generateToken, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function createAdditionalUser(formData: any) {
  const validatedFields = additionalUserSchema.safeParse({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    role: formData.role,
    password: formData.password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await api.post(AUTH.additionalUser, formData);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function updateUser(payload: any, userId: string) {
  // const validatedFields = updateUserSchema.safeParse({
  //   firstName: formData.firstName,
  //   lastName: formData.lastName,
  //   email: formData.email,
  //   role: formData.role,
  // });

  // if (!validatedFields.success) {
  //   return {
  //     errors: validatedFields.error.flatten().fieldErrors,
  //   };
  // }
  // const payload = {
  //   firstName: formData.firstName,
  //   lastName: formData.lastName,
  //   email: formData.email,
  //   role: +formData.role,
  //   businessID: formData.businessID,
  //   cooperateID: formData.cooperateID,
  //   isActive: formData.isActive,
  //   imageReference: formData.imageReference,
  // };

  try {
    // const data = await api.put(`${AUTH.user}?userId=${formData.id}`, payload);
    const data = await api.put(`${AUTH.user}?userId=${userId}`, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function confirmEmail(formData: any) {
  try {
    const data = await api.post(AUTH.user, formData);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function createBusiness(formData: any) {
  const validatedFields = businessSchema.safeParse({
    name: formData.name,
    businessCategory: formData.businessCategory,
    address: formData.address,
    state: formData.state,
    city: formData.city,
    contactEmailAddress: formData.contactEmailAddress,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await api.post(AUTH.registerBusiness, formData);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function loginUser(formData: any) {
  const validatedFields = loginSchema.safeParse({
    password: formData.password,
    email: formData.email,
  });
  const encryptData = encryptPayload(formData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  try {
    const data = await api.post(AUTH.loginUser, {
      encryptedPayload: encryptData,
    });
    return data;
  } catch (error) {
    handleError(error, false);
    return error;
  }
}
export async function loginUserSelectedBusiness(
  formData: any,
  businessId: string
) {
  const validatedFields = loginSchema.safeParse({
    password: formData.password,
    email: formData.email,
  });
  const encryptData = encryptPayload(formData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headers = businessId ? { businessId } : {};
  try {
    const data = await api.post(
      AUTH.loginUserSelectedBusiness,
      {
        encryptedPayload: encryptData,
      },
      {
        headers,
      }
    );

    return data;
  } catch (error) {
    handleError(error);
  }
}
// export async function generateRefreshToken(formData: any) {
//   try {
//     const data = await api.post(AUTH.refreshToken, formData);

//     return data;
//   } catch (error) {
//     handleError(error);
//   }
// }
export async function generateRefreshToken(formData: any) {
  const encryptData = encryptPayload(formData);
  return api.post(AUTH.refreshToken, {
    encryptedPayload: encryptData,
  });
}

export async function forgetPassword(formData: any) {
  const validatedFields = forgetPasswordSchema.safeParse({
    email: formData.email,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  try {
    const data = await api.post(AUTH.forgetPassword, formData);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function changePassword(formData: any) {
  const validatedFields = changePasswordSchema.safeParse({
    oldPassword: formData?.oldPassword,
    newPassword: formData?.newPassword,
    confirmPassword: formData?.confirmPassword,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const payload = {
    email: formData?.email,
    oldPassword: formData?.oldPassword,
    newPassword: formData?.newPassword,
  };
  try {
    const data = await api.post(AUTH.changePassword, payload);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function logout() {
  try {
    const data = await api.post(AUTH.logout);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getBusinessDetails(formData: any) {
  const headers = formData.id ? { businessId: formData.id } : {};

  try {
    const data = await api.get(AUTH.getBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getUser(id: string) {
  try {
    const data = await api.get(`${AUTH.user}?userId=${id}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function deleteUser(id: string) {
  try {
    const data = await api.delete(`${AUTH.user}?userId=${id}`);

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
export async function getRoleCount(businessId: string, cooperateId: string) {
  try {
    const data = await api.get(
      `${AUTH.getRoleCount}?cooperateId=${cooperateId}&businessId=${businessId}`
    );

    return data;
  } catch (error) {
    handleError(error, false);
  }
}
