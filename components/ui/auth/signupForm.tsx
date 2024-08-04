'use client';
import { createUser } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { useGlobalContext } from '@/hooks/globalProvider';
import { notify } from '@/lib/utils';
import { Spacer, Tooltip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';
const SignupForm = () => {
  const router = useRouter();
  const { setUserData } = useGlobalContext();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [signupFormData, setSignupFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 0,
    isActive: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setSignupFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e) => {
    e.preventDefault();

    setUserData(signupFormData);
    setLoading(true);
    const data = await createUser(signupFormData);
    setLoading(false);
    setResponse(data);

    if (data?.data?.isSuccessful) {
      router.push('/auth/confirm-email');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  return (
    <form onSubmit={submitFormData} autoComplete='off'>
      <div className='flex md:flex-row flex-col gap-5'>
        <CustomInput
          type='text'
          name='firstName'
          label='First name'
          errorMessage={response?.errors?.firstName?.[0]}
          onChange={handleInputChange}
          value={signupFormData.firstName}
          placeholder='First name'
        />

        <CustomInput
          type='text'
          name='lastName'
          errorMessage={response?.errors?.lastName?.[0]}
          onChange={handleInputChange}
          value={signupFormData.lastName}
          label='Last name'
          placeholder='Last name'
        />
      </div>
      <Spacer y={6} />
      <CustomInput
        type='email'
        name='email'
        errorMessage={response?.errors?.email?.[0]}
        onChange={handleInputChange}
        value={signupFormData.email}
        label='Email Address'
        placeholder='Enter email'
        endContent={<FaRegEnvelope className='text-foreground-500 text-l' />}
      />

      <Spacer y={6} />
      <Tooltip
        showArrow
        placement='left'
        classNames={{
          base: [
            // arrow color
            'before:bg-neutral-400 dark:before:bg-white',
          ],
          content: [
            'py-2 px-4 shadow-xl bg-[#F2F8FF] rounded-md',
            'text-black bg-gradient-to-br from-white to-neutral-400',
          ],
        }}
        content={
          <div className='px-1 py-2 space-y-2'>
            <div className='text-small font-bold'>
              Your password should include
            </div>
            <div className='text-tiny'>
              One uppercase character e.g A,B,C,etc
            </div>
            <div className='text-tiny'>
              One lowercase character e.g a,b,c,etc
            </div>
            <div className='text-tiny'>One special character e.g !,@,#,etc</div>
            <div className='text-tiny'>One number e.g 1,2,3,4 etc</div>
            <div className='text-tiny'>At least 8 characters </div>
          </div>
        }
      >
        <div>
          <CustomInput
            errorMessage={response?.errors?.password?.[0]}
            value={signupFormData.password}
            onChange={handleInputChange}
            type='password'
            name='password'
            label='Password'
            placeholder='Enter password'
          />
        </div>
      </Tooltip>

      <Spacer y={6} />
      <CustomInput
        errorMessage={response?.errors?.confirmPassword?.[0]}
        value={signupFormData.confirmPassword}
        onChange={handleInputChange}
        type='password'
        name='confirmPassword'
        label='Confirm Password'
        placeholder='Enter password'
      />

      <Spacer y={6} />

      <CustomButton loading={loading} disabled={loading} type='submit'>
        Create Account
      </CustomButton>
    </form>
  );
};

export default SignupForm;
