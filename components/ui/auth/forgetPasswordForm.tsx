'use client';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { Spacer } from '@nextui-org/react';
import React from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';

const ForgetPasswordForm = () => {
  return (
    <form autoComplete='off'>
      <CustomInput
        type='email'
        label='Email Address'
        placeholder='Enter Email'
        endContent={<FaRegEnvelope className='text-foreground-500 text-l' />}
      />
      <Spacer y={8} />
      <CustomButton type='submit'>Send password reset link</CustomButton>
    </form>
  );
};

export default ForgetPasswordForm;
