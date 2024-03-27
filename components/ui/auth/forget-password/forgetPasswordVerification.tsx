'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spacer } from '@nextui-org/react';
import { CustomButton } from '@/components/customButton';
import OtpInput from 'react-otp-input';
import { notify, saveJsonItemToLocalStorage } from '@/lib/utils';
import { confirmEmail } from '@/app/api/controllers/auth';
import { AUTH } from '@/app/api/api-url';
import api from '@/app/api/apiService';
import { IoMdRefresh } from 'react-icons/io';
import toast from 'react-hot-toast';
import { useGlobalContext } from '@/hooks/globalProvider';
import { CustomInput } from '@/components/CustomInput';
const ForgetPasswordVerificationForm = ({ setScreen, email }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const payload = {
    email: email,
    password: password,
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setScreen(3);
    setLoading(true);
    const data = await confirmEmail(payload);
    setLoading(false);
    setResponse(data);
    if (data?.data?.isSuccessful) {
      setScreen(3);
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
      <h2 className='text-[28px] font-bold '>Forgot Password</h2>
      <p className='text-sm  text-grey500 mb-8'>
        Enter your email that was sent to{' '}
        <span className='font-bold text-black'>{email}</span>
      </p>
      <form onSubmit={submitFormData} autoComplete='off'>
        <Spacer y={6} />

        <CustomInput
          errorMessage={response?.errors?.password?.[0]}
          value={password}
          onChange={(e) => {
            setResponse(null);
            setPassword(e.target.value);
          }}
          type='password'
          label='Password'
          name='password'
          placeholder='Enter password'
          // isRequired={true}
        />

        <Spacer y={8} />

        <CustomButton loading={loading} disabled={loading} type='submit'>
          Proceed
        </CustomButton>
      </form>
    </>
  );
};

export default ForgetPasswordVerificationForm;
