'use client';

import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

import { useState } from 'react';
import { ExtendedInput as Input } from '@/utilities/ui-config/extendVariant';

interface CustomInputProps {
  type?: string;
  label: string;
  placeholder?: string;
  endContent?: JSX.Element | null;
  isRequired?: boolean;
  startContent?: string | JSX.Element;
}

export const CustomInput = ({
  type = 'text',
  label,
  placeholder,
  endContent,
  isRequired,
  startContent,
}: CustomInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const passwordType = isVisible ? 'text' : 'password';
  const passwordEndContent = (
    <button
      className='focus:outline-none'
      type='button'
      onClick={toggleVisibility}
    >
      {isVisible ? (
        <IoEyeOutline className='text-foreground-500 text-lg' />
      ) : (
        <IoEyeOffOutline className='text-foreground-500 text-lg' />
      )}
    </button>
  );

  return (
    <Input
      key='outside'
      type={type === 'password' ? passwordType : type}
      label={label}
      variant='bordered'
      color='stone'
      radius={'mdextra'}
      placeholder={placeholder}
      labelPlacement='outside'
      isRequired={isRequired}
      autoComplete='false'
      name='hidden'
      // errorMessage='Email not correct'
      // isInvalid={true}
      size={'lg'}
      endContent={type === 'password' ? passwordEndContent : endContent}
      startContent={startContent}
    />
  );
};
