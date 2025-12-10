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

  const linkColor = "text-secondaryColor hover:text-secondaryColor/80";

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold mb-3">Forgot Password</h2>
        <p className="text-base text-gray-400">
          Enter your email to request a temporary password
        </p>
      </div>

      <form onSubmit={submitFormData} autoComplete="off">
        <CustomInput
          type="email"
          label=""
          errorMessage={errors.email?.[0]}
          onChange={handleEmailChange}
          value={email}
          placeholder="Enter email"
          bgColor="bg-transparent"
          classnames="h-[56px] rounded-xl border border-secondaryColor !border-secondaryColor focus-within:!border-secondaryColor hover:!border-secondaryColor data-[focus=true]:!border-secondaryColor data-[hover=true]:!border-secondaryColor"
          inputTextColor="text-gray-200"
          endContent={<FaRegEnvelope className="text-gray-300 text-lg" />}
        />

        <Spacer y={7} />

        <CustomButton
          loading={loading}
          disabled={loading}
          type="submit"
          className="bg-secondaryColor font-[600] text-[16px] w-full rounded-xl h-[55px] text-white hover:bg-secondaryColor/90 focus:bg-secondaryColor/90 active:bg-secondaryColor/80 transition-all"
        >
          Send password
        </CustomButton>
      </form>

      <Spacer y={6} />

      <div className="flex items-center justify-center gap-2">
        <p className="text-gray-400 text-sm m-0">Remember password?</p>
        <Link
          className={`text-sm font-semibold ${linkColor}`}
          href="/auth/login"
        >
          Log In
        </Link>
      </div>
    </>
  );
};

export default ForgetPasswordForm;
