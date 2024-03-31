import { z } from 'zod';
import api, { handleError } from '../apiService';
import { AUTH } from '../api-url';
import { notify } from '@/lib/utils';

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);
const userSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: 'Firstname field is required' }),
  lastName: z.string().trim().min(1, { message: 'Lastname field is required' }),
  email: z.string().trim().min(1, { message: 'Please enter a valid email' }),
  password: z
    .string()
    .trim()
    .min(8, 'The password must be at least 8 characters long')
    .max(32, 'The password must be a maximun 32 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, { message: 'Please enter a valid email' }),
  password: z.string().trim().min(1, { message: 'Password field is required' }),
});
const forgetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Please enter a valid email' })
    .email('This is not a valid email.'),
});
const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(1, { message: 'Enter your old password' }),
    newPassword: z
      .string()
      .trim()
      .min(8, 'The password must be at least 8 characters long')
      .max(32, 'The password must be a maximun 32 characters'),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: 'Enter your new password' }),
  })
  .refine((data) => data.newPassword === data?.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Business name field is required' }),
  address: z.string().trim().min(1, { message: 'Address field is required' }),
  businessCategory: z
    .number()
    .min(1, { message: 'Please select your business category' }),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'The password must be at least 8 characters long')
    .max(32, 'The password must be a maximun 32 characters'),
});

export async function createUser(formData: any) {
  const validatedFields = userSchema.safeParse({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
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
export async function confirmEmail(formData: any) {
  try {
    const data = await api.post(AUTH.registerUser, formData);

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

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  try {
    const data = await api.post(AUTH.loginUser, formData);

    return data;
  } catch (error) {
    handleError(error);
  }
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
export async function getBusinessDetails(formData: any) {
  const headers = formData.businessId
    ? { businessId: formData.businessId }
    : {};

  try {
    const data = await api.get(AUTH.getBusiness, {
      headers,
    });

    return data;
  } catch (error) {
    handleError(error);
  }
}
