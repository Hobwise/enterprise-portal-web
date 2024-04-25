import { z } from 'zod';

export const passwordValidation = () => {
  return z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .trim()
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*.,()]/,
      'Password must contain at least one special character'
    );
};
export const inputNameValidation = (title: string) => {
  return z
    .string()
    .trim()
    .min(1, `${title} field is required`)
    .max(50, `${title} cannot be longer than 50 characters`)
    .regex(/^[a-zA-Z]+$/, `${title} must only contain alphabets`);
};
export const businessNameValidation = () => {
  return z
    .string()
    .min(1, `Business name field is required`)
    .max(50, `Business name cannot be longer than 50 characters`)
    .regex(/^[a-zA-Z\s]+$/, 'Business name must only contain alphabets');
};
export const businessAddressValidation = () => {
  return z
    .string()

    .min(5, 'Business address must contain at least 5 characters')
    .max(100, `Business address cannot be longer than 100 characters`)
    .regex(
      /^[a-zA-Z0-9\s,]+$/,
      'Business address must only contain alphabets and numbers'
    );
};
export const emailValidation = () => {
  return z
    .string()
    .trim()
    .min(1, { message: 'Please enter a valid email' })
    .email('This is not a valid email.');
};
