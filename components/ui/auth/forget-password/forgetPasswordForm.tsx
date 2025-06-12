'use client';
import { forgetPassword } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { notify } from '@/lib/utils';
import { Spacer } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaRegEnvelope } from 'react-icons/fa6';

interface ForgetPasswordFormProps {
  setScreen: (screen: number) => void;
  email: string;
  setEmail: (email: string) => void;
}

interface FormErrors {
  email?: string[];
}

const ForgetPasswordForm = ({ setScreen, email, setEmail }: ForgetPasswordFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!email) {
      newErrors.email = ["Email is required"];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = ["Please enter a valid email address"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const submitFormData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await forgetPassword({ email });

      if (data?.data?.isSuccessful) {
        toast.success('A temporary password has been sent to your email');
        setScreen(2);
      } else if (data?.data?.error) {
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
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
      <h2 className="text-[28px] font-bold">Forgot Password</h2>
      <p className="text-sm text-grey500 mb-8">
        Enter your email to request a temporary password
      </p>
      <Spacer y={8} />
      <form onSubmit={submitFormData} autoComplete="off">
        <CustomInput
          type="email"
          label="Email Address"
          errorMessage={errors.email?.[0]}
          onChange={handleEmailChange}
          value={email}
          placeholder="Enter email"
          endContent={<FaRegEnvelope className="text-foreground-500 text-l" />}
        />
        <Spacer y={8} />
        <CustomButton loading={loading} disabled={loading} type="submit">
          Send password
        </CustomButton>
      </form>
      <Spacer y={8} />
      <div className="flex items-center gap-2">
        <p className="text-grey400 text-xs m-0">Remember password?</p>
        <Link className="text-primaryColor text-sm" href="/auth/login">
          Log In
        </Link>
      </div>
    </>
  );
};

export default ForgetPasswordForm;
