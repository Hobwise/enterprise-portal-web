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
      newErrors.oldPassword = [isForced ? 'Current password is required' : 'Password is required'];
    }

    if (!passwordFormData.password) {
      newErrors.password = ['New password is required'];
    } else if (!validatePassword(passwordFormData.password)) {
      newErrors.password = [
        'Password must contain uppercase, lowercase, special character, number and be at least 8 characters long',
      ];
    }

    if (!passwordFormData.confirmPassword) {
      newErrors.confirmPassword = ['Please confirm your password'];
    } else if (passwordFormData.password !== passwordFormData.confirmPassword) {
      newErrors.confirmPassword = ['Passwords do not match'];
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

  const inputBgColor = 'bg-transparent lg:bg-white';
  const inputClasses =
    'h-[58px] rounded-xl border border-secondaryColor/40 lg:border-transparent lg:shadow-[0_1px_2px_rgba(16,24,40,0.05)] data-[hover=true]:!border-secondaryColor/60 data-[focus=true]:!border-secondaryColor';

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-[34px] font-extrabold leading-tight text-white lg:text-[40px] lg:text-[#1F2937]">
          {isForced ? 'Update Password' : 'Create Password'}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/70 lg:text-[#6B7280]">
          {isForced ? (
            <>
              You need to update your password for security reasons. Please enter your current
              password and create a new one for{' '}
              <span className="font-semibold text-secondaryColor">{email}</span>
            </>
          ) : (
            <>
              Your email{' '}
              <span className="font-semibold text-secondaryColor">{email}</span> has been
              confirmed.
              <br className="hidden lg:block" /> Create new password
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
          placeholder={
            isForced ? 'Enter current password' : 'Enter temporary password'
          }
          bgColor={inputBgColor}
          classnames={inputClasses}
          inputTextColor="text-white lg:text-[#1F2937]"
          eyeIconStyle="text-base text-white/70 lg:text-[#1F2937]"
        />

        <Spacer y={4} />

        <CustomInput
          errorMessage={errors.password?.[0]}
          value={passwordFormData.password}
          onChange={handleInputChange}
          type="password"
          name="password"
          label=""
          placeholder="Create new password"
          bgColor={inputBgColor}
          classnames={inputClasses}
          inputTextColor="text-white lg:text-[#1F2937]"
          eyeIconStyle="text-base text-white/70 lg:text-[#1F2937]"
        />

        <Spacer y={4} />

        <CustomInput
          errorMessage={errors.confirmPassword?.[0]}
          value={passwordFormData.confirmPassword}
          onChange={handleInputChange}
          type="password"
          name="confirmPassword"
          label=""
          placeholder="Confirm password"
          bgColor={inputBgColor}
          classnames={inputClasses}
          inputTextColor="text-white lg:text-[#1F2937]"
          eyeIconStyle="text-base text-white/70 lg:text-[#1F2937]"
        />

        <Spacer y={6} />

        <CustomButton
          loading={loading}
          disabled={loading}
          type="submit"
          className={`flex h-[56px] w-full items-center justify-center rounded-xl text-[16px] font-semibold text-white transition-colors ${
            passwordFormData.oldPassword &&
            passwordFormData.password &&
            passwordFormData.confirmPassword
              ? 'bg-primaryColor hover:bg-primaryColor/90 focus:bg-primaryColor/90 active:bg-primaryColor/80'
              : 'bg-secondaryColor hover:bg-secondaryColor/90 focus:bg-secondaryColor/90 active:bg-secondaryColor/80'
          }`}
        >
          {loading ? 'Saving...' : 'Save Password'}
        </CustomButton>
      </form>
    </>
  );
};

export default ChangePasswordForm;
