'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomInput } from '@/components/CustomInput';
import { Checkbox, Spacer } from '@nextui-org/react';
import { FaRegEnvelope } from 'react-icons/fa6';
import { CustomButton } from '@/components/customButton';
import Link from 'next/link';
import { loginUser } from '@/app/api/controllers/auth';
import { notify, saveJsonItemToLocalStorage } from '@/lib/utils';
const LoginForm = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    setResponse(null);
    const { name, value } = e.target;
    setLoginFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e) => {
    e.preventDefault();

    setLoading(true);
    const data = await loginUser(loginFormData);
    console.log(data, 'data');
    setLoading(false);
    setResponse(data);
    const businesses = data?.data?.data?.businesses || [];

    if (data?.data?.isSuccessful) {
      saveJsonItemToLocalStorage('userInformation', data?.data?.data);
      router.push(
        businesses.length >= 1 ? '/dashboard' : '/auth/business-information'
      );
    } else if (data?.data?.error) {
      notify({ message: data?.data?.error, type: 'error' });
    }
  };

  return (
    <form onSubmit={submitFormData} autoComplete='off'>
      <CustomInput
        type='email'
        name='email'
        errorMessage={response?.errors?.email?.[0]}
        onChange={handleInputChange}
        value={loginFormData.email}
        label='Email Address'
        placeholder='Enter Email'
        // isRequired={true}
        endContent={<FaRegEnvelope className='text-foreground-500 text-l' />}
      />

      <Spacer y={6} />
      <CustomInput
        errorMessage={response?.errors?.password?.[0]}
        value={loginFormData.password}
        onChange={handleInputChange}
        type='password'
        label='password'
        name='password'
        placeholder='Enter password'
        // isRequired={true}
      />

      <Spacer y={6} />
      <div className='flex items-center justify-between'>
        <Checkbox size='sm' className='rounded-lg' color='default'>
          Remember me
          {/* for 30 days */}
        </Checkbox>
        <Link
          className='text-primaryColor text-sm'
          href='/auth/forget-password'
        >
          Forget Password?
        </Link>
      </div>
      <Spacer y={6} />
      <CustomButton loading={loading} disabled={loading} type='submit'>
        Log into Account
      </CustomButton>
    </form>
  );
};

export default LoginForm;
