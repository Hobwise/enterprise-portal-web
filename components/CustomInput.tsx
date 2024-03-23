'use client';

import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

import { useState } from 'react';
import { Input } from '@nextui-org/react';
// import { ExtendedInput as Input } from '@/utilities/ui-config/extendVariant';

interface CustomInputProps {
  type?: string;
  label?: string;
  size?: 'lg' | 'md' | 'sm';
  classnames?: string;
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
  classnames,
  size = 'lg',
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
      classNames={{
        label: 'text-[#000] font-[500] text-[14px]',
        base: 'bg-none',
        inputWrapper: [
          `${classnames}  bg-none rounded-[6px] shadow-none  hover:border-[#C3ADFF] focus:border-[#C3ADFF]`,
        ],
        innerWrapper: 'bg-none border-none',
        input: ['bg-none', 'text-black placeholder:text-[14px]'],
      }}
      // className={classnames}
      // color='stone'
      aria-autocomplete='both'
      aria-haspopup='false'
      autocorrect='off'
      name='hidden'
      id='hidden'
      autofocus=''
      // radius={'mdextra'}
      placeholder={placeholder}
      labelPlacement='outside'
      isRequired={isRequired}
      spellcheck='false'
      ng-model='name'
      autocomplete='new-password'
      // errorMessage='Email not correct'
      // isInvalid={true}
      size={size}
      endContent={type === 'password' ? passwordEndContent : endContent}
      startContent={startContent}
    />
  );
};
