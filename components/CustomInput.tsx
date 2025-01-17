'use client';

import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

import { Input } from '@nextui-org/react';
import { useState } from 'react';

interface CustomInputProps {
  type?: string;
  label?: string;
  defaultValue?: string | number;
  value?: string;
  name?: string;
  errorMessage?: any;
  size?: 'lg' | 'md' | 'sm';
  classnames?: string;
  placeholder?: string;
  endContent?: JSX.Element | null;
  isRequired?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onChange?: any;
  startContent?: string | JSX.Element;
  min?: string;
  max?: string;
}

export const CustomInput = ({
  type = 'text',
  label,
  value,
  placeholder,
  endContent,
  hidden,
  name,
  disabled,
  onChange,
  isRequired,
  startContent,
  defaultValue,
  classnames = 'bg-none rounded-[6px] shadow-none  hover:border-[#C3ADFF] focus:border-[#C3ADFF]',
  errorMessage,
  size = 'lg',
  min,
  max
}: CustomInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
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

  const handleCopy = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === 'password') {
      event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === 'password') {
      event.preventDefault();
    }
  };

  return (
    <Input
      key='outside'
      type={type === 'password' ? passwordType : type}
      label={label}
      value={value}
      name={name}
      hidden={hidden}
      disabled={disabled}
      onChange={onChange}
      defaultValue={defaultValue}
      variant='bordered'
      classNames={{
        label: 'text-[#000] font-[500] text-[14px]',
        base: 'bg-none',
        inputWrapper: [
          `${classnames} ${disabled ? 'bg-secondaryGrey' : 'bg-white'} `,
        ],
        innerWrapper: `bg-none border-none`,
        input: ['bg-none', 'text-black placeholder:text-[14px] bg-none'],
      }}
      aria-haspopup='false'
      autoCorrect='off'
      placeholder={placeholder}
      labelPlacement='outside'
      isRequired={isRequired}
      spellCheck='false'
      ng-model='name'
      autoComplete='new-password'
      errorMessage={errorMessage}
      isInvalid={errorMessage && true}
      size={size}
      endContent={type === 'password' ? passwordEndContent : endContent}
      startContent={startContent}
      onCopy={handleCopy}
      onPaste={handlePaste}
      min={min}
      max={max}
     />
  );
};
