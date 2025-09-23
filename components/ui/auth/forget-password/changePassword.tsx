'use client';
import { changePassword } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { notify } from '@/lib/utils';
import { Spacer } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ChangePasswordFormProps {
  email: string;
  isForced?: boolean;
}

interface PasswordFormData {
  password: string;
  confirmPassword: string;
  oldPassword: string;
}

interface FormErrors {
  password?: string[];
  confirmPassword?: string[];
  oldPassword?: string[];
}

const ChangePasswordForm = ({ email, isForced = false }: ChangePasswordFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: '',
    oldPassword: '',
  });

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber && isLongEnough;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!passwordFormData.oldPassword) {
      newErrors.oldPassword = [isForced ? "Current password is required" : "Password is required"];
    }

    if (!passwordFormData.password) {
      newErrors.password = ["New password is required"];
    } else if (!validatePassword(passwordFormData.password)) {
      newErrors.password = ["Password must contain uppercase, lowercase, special character, number and be at least 8 characters long"];
    }

    if (!passwordFormData.confirmPassword) {
      newErrors.confirmPassword = ["Please confirm your password"];
    } else if (passwordFormData.password !== passwordFormData.confirmPassword) {
      newErrors.confirmPassword = ["Passwords do not match"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const submitFormData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await changePassword({
        email,
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.password,
        confirmPassword: passwordFormData.confirmPassword,
      });

      if (data?.data?.isSuccessful) {
        toast.success(
          isForced
            ? 'Password updated successfully! You can now login with your new password.'
            : 'Your password has been changed, Proceed to login'
        );
        // Add a small delay to ensure the toast is visible before redirect
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else if (data?.data?.error) {
        notify({
          title: 'Error!',
          text: data?.data?.error?.responseDescription || data?.data?.error,
          type: 'error',
        });
      } else if (data?.errors) {
        // Handle validation errors
        setErrors(data.errors);
      }
    } catch (error: any) {
      notify({
        title: 'Error!',
        text: error.message || 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-[28px] font-bold">
        {isForced ? 'Update Password Required' : 'Enter password'}
      </h2>
      <p className="text-sm text-tomato mb-8">
        {isForced ? (
          <>
            You need to update your password for security reasons. Please enter your current password and create a new one for{' '}
            <span className="font-bold">{email}</span>
          </>
        ) : (
          <>
            Enter the password that was sent to{' '}
            <span className="font-bold">{email}</span>
          </>
        )}
      </p>

      <Spacer y={8} />
      <form onSubmit={submitFormData} autoComplete="off">
        <CustomInput
          errorMessage={errors.oldPassword?.[0]}
          value={passwordFormData.oldPassword}
          onChange={handleInputChange}
          name="oldPassword"
          type="password"
          label={isForced ? "Current Password" : "Enter Password"}
          placeholder={isForced ? "Enter current password" : "Enter password"}
        />
        <Spacer y={6} />
        <CustomInput
          errorMessage={errors.password?.[0]}
          value={passwordFormData.password}
          onChange={handleInputChange}
          type="password"
          name="password"
          label="Enter New Password"
          placeholder="Enter password"
        />
        <Spacer y={6} />
        <CustomInput
          errorMessage={errors.confirmPassword?.[0]}
          value={passwordFormData.confirmPassword}
          onChange={handleInputChange}
          type="password"
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Confirm password"
        />
        <Spacer y={8} />
        <CustomButton loading={loading} disabled={loading} type="submit">
          Save new password
        </CustomButton>
      </form>
    </>
  );
};

export default ChangePasswordForm;
