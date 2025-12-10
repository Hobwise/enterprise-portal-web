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
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold mb-3">
          {isForced ? 'Update Password Required' : 'Enter Password'}
        </h2>
        <p className="text-base text-gray-400">
          {isForced ? (
            <>
              You need to update your password for security reasons. Please enter your current password and create a new one for{' '}
              <span className="font-semibold text-secondaryColor">{email}</span>
            </>
          ) : (
            <>
              Enter the password that was sent to{' '}
              <span className="font-semibold text-secondaryColor">{email}</span>
            </>
          )}
        </p>
      </div>

      <form onSubmit={submitFormData} autoComplete="off">
        <CustomInput
          errorMessage={errors.oldPassword?.[0]}
          value={passwordFormData.oldPassword}
          onChange={handleInputChange}
          name="oldPassword"
          type="password"
          label=""
          placeholder={isForced ? "Enter current password" : "Enter password"}
          bgColor="bg-transparent"
          classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
          inputTextColor="text-gray-200"
          eyeIconStyle="text-gray-300 text-lg"
        />

        <Spacer y={5} />

        <CustomInput
          errorMessage={errors.password?.[0]}
          value={passwordFormData.password}
          onChange={handleInputChange}
          type="password"
          name="password"
          label=""
          placeholder="Enter new password"
          bgColor="bg-transparent"
          classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
          inputTextColor="text-gray-200"
          eyeIconStyle="text-gray-300 text-lg"
        />

        <Spacer y={5} />

        <CustomInput
          errorMessage={errors.confirmPassword?.[0]}
          value={passwordFormData.confirmPassword}
          onChange={handleInputChange}
          type="password"
          name="confirmPassword"
          label=""
          placeholder="Confirm new password"
          bgColor="bg-transparent"
          classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
          inputTextColor="text-gray-200"
          eyeIconStyle="text-gray-300 text-lg"
        />

        <Spacer y={7} />

        <CustomButton
          loading={loading}
          disabled={loading}
          type="submit"
          className="bg-secondaryColor font-[600] text-[16px] w-full rounded-xl h-[55px] text-white hover:bg-secondaryColor/90 focus:bg-secondaryColor/90 active:bg-secondaryColor/80 transition-all"
        >
          Save new password
        </CustomButton>
      </form>
    </>
  );
};

export default ChangePasswordForm;
