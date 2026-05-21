'use client';
import { forgetPassword } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { notify } from '@/lib/utils';
import { Spacer } from '@nextui-org/react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaRegEnvelope } from 'react-icons/fa6';
import { LuArrowRight } from 'react-icons/lu';

interface ForgetPasswordFormProps {
  setScreen: (screen: number) => void;
  email: string;
  setEmail: (email: string) => void;
  screen?: number;
}

interface FormErrors {
  email?: string[];
}

const ForgetPasswordForm = ({ setScreen, email, setEmail }: ForgetPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = ['Email is required'];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
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

  const linkColor = 'text-secondaryColor hover:text-secondaryColor/80';

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-[34px] font-extrabold leading-tight text-white lg:text-[40px] lg:text-[#1F2937]">
          Forgot Password
        </h2>
        <p className="mt-2 text-[15px] text-white/70 lg:text-[#6B7280]">
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
          placeholder="Enter Email"
          bgColor="bg-transparent lg:bg-white"
          classnames="h-[58px] rounded-xl border border-secondaryColor/40 lg:border-transparent lg:shadow-[0_1px_2px_rgba(16,24,40,0.05)] data-[hover=true]:!border-secondaryColor/60 data-[focus=true]:!border-secondaryColor"
          inputTextColor="text-white lg:text-[#1F2937]"
          endContent={<FaRegEnvelope className="text-base text-white/70 lg:text-[#1F2937]" />}
        />

        <Spacer y={6} />

        <CustomButton
          loading={loading}
          disabled={loading}
          type="submit"
          className={`group flex h-[56px] w-full items-center justify-center gap-3 rounded-xl text-[16px] font-semibold text-white transition-colors ${
            email
              ? 'bg-primaryColor hover:bg-primaryColor/90 focus:bg-primaryColor/90 active:bg-primaryColor/80'
              : 'bg-secondaryColor hover:bg-secondaryColor/90 focus:bg-secondaryColor/90 active:bg-secondaryColor/80'
          }`}
        >
          <span>{loading ? 'Sending...' : 'Send password'}</span>
          {!loading && (
            <LuArrowRight className="text-lg transition-transform group-hover:translate-x-0.5" />
          )}
        </CustomButton>
      </form>

      <div className="mt-7 flex items-center justify-center gap-2">
        <p className="m-0 text-[14px] text-white/70 lg:text-[#6B7280]">Remember password?</p>
        <Link className={`text-[14px] font-semibold ${linkColor}`} href="/auth/login">
          Log In
        </Link>
      </div>
    </>
  );
};

export default ForgetPasswordForm;
