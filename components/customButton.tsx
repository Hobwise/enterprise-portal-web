import { Button } from "@nextui-org/react";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  backgroundColor?: string;
  className?: string;
  radius?: string;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: any;
  disableRipple?: boolean;
  type?: "submit" | "button" | "reset";
  style?: React.CSSProperties;
}
export const CustomButton = ({
  children,
  disabled,
  loading,
  onClick,
  title,
  disableRipple = false,
  type = "submit",
  backgroundColor = "bg-primaryColor",
  radius = "rounded-lg",
  className = "text-white font-bold text-md  h-[55px] w-full",
  style,
}: ButtonProps) => {
  return (
    <Button
      type={type}
      title={title}
      onClick={onClick}
      isLoading={loading}
      disabled={disabled}
      disableRipple={disableRipple}
      aria-label="submit button"
      style={style}
      spinner={
        <svg
          className="animate-spin h-5 w-5 text-current"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      }
      className={`${style ? '' : backgroundColor} ${radius} ${className} disabled:bg-grey500 disabled:cursor-not-allowed ${
        disabled || loading ? "pointer-events-none opacity-70" : ""
      }`}
    >
      {loading ? "" : children}
    </Button>
  );
};
