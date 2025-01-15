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

const ForgetPasswordForm = ({ setScreen, email, setEmail }: any) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);
    const payload = {
      email: email,
    };
    const data = await forgetPassword(payload);

    setLoading(false);
    setResponse(data);

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
  };
  return (
    <>
      <h2 className="text-[28px] font-bold ">Forgot Password</h2>
      <p className="text-sm  text-grey500 mb-8">Enter your email to request a temporary password</p>
      <Spacer y={8} />
      <form onSubmit={submitFormData} autoComplete="off">
        <CustomInput
          type="text"
          label="Email Address"
          errorMessage={response?.errors?.email?.[0]}
          onChange={(e) => {
            setResponse(null);
            setEmail(e.target.value);
          }}
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
        <p className="text-grey400 text-xs m-0">{`Remember password?`}</p>
        <Link className="text-primaryColor text-sm" href="/auth/login">
          Log In
        </Link>
      </div>
    </>
  );
};

export default ForgetPasswordForm;
