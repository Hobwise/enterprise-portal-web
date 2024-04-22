'use client';

import { useState } from 'react';
import { Textarea } from '@nextui-org/react';

interface CustomTextProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  errorMessage?: any;
  size?: 'lg' | 'md' | 'sm';
  classnames?: string;
  placeholder?: string;

  isRequired?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onChange?: any;
}

export const CustomTextArea = ({
  label,
  value,
  placeholder,
  defaultValue,
  hidden,
  name,
  disabled,
  onChange,
  isRequired,

  classnames = 'bg-none rounded-[6px] shadow-none  hover:border-[#C3ADFF] focus:border-[#C3ADFF]',
  errorMessage,

  size = 'lg',
}: CustomTextProps) => {
  return (
    <Textarea
      key='outside'
      label={label}
      value={value}
      defaultValue={defaultValue}
      name={name}
      hidden={hidden}
      disabled={disabled}
      onChange={onChange}
      variant='bordered'
      classNames={{
        label: 'text-[#000] font-[500] text-[14px]',
        base: 'bg-none',
        inputWrapper: [`${classnames} ${disabled && 'bg-secondaryGrey'} `],
        innerWrapper: ` bg-none border-none`,
        input: ['bg-none', 'text-black placeholder:text-[14px]'],
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
    />
  );
};
