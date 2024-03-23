import { Button } from '@nextui-org/react';
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  backgroundColor?: string;
  radius?: string;
  type?: 'submit' | 'button' | 'reset';
}
export const CustomButton = ({
  children,
  type = 'submit',
  backgroundColor = 'bg-primaryColor',
  radius = 'rounded-lg',
}: ButtonProps) => {
  return (
    <Button
      type={type}
      className={`${backgroundColor}  ${radius} text-white font-bold text-md  h-[55px] w-full`}
    >
      {children}
    </Button>
  );
};
