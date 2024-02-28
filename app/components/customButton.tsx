import { Button } from '@nextui-org/react';
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  backgroundColor?: string;
  radius?: string;
}
export const CustomButton = ({
  children,
  backgroundColor = 'bg-primaryColor',
  radius = 'rounded-lg',
}: ButtonProps) => {
  return (
    <Button
      type='submit'
      className={`${backgroundColor}  ${radius} text-white font-bold text-md  p-7 w-full`}
    >
      {children}
    </Button>
  );
};
