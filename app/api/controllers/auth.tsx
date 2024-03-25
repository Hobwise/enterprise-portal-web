import { z } from 'zod';
import api, { handleError } from '../apiService';
import { AUTH } from '../api-url';
import { notify } from '@/lib/utils';

const userSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: 'Firstname field is required' }),
  lastName: z.string().trim().min(1, { message: 'Lastname field is required' }),
  email: z.string().trim().min(1, { message: 'Please enter a valid email' }),
  password: z.string().trim().min(1, { message: 'Password field is required' }),
});
const loginSchema = z.object({
  email: z.string().trim().min(1, { message: 'Please enter a valid email' }),
  password: z.string().trim().min(1, { message: 'Password field is required' }),
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

export async function createUser(formData) {
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
export async function confirmEmail(formData) {
  try {
    const data = await api.post(AUTH.registerUser, formData);

    return data;
  } catch (error) {
    handleError(error);
  }
}
export async function createBusiness(formData) {
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
export async function loginUser(formData) {
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
