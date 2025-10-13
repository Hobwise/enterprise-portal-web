"use client";

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

import { Input } from "@nextui-org/react";
import { useState, useRef } from "react";

interface CustomInputProps {
  type?: string;
  label?: string;
  defaultValue?: string | number;
  value?: string | number;
  name?: string;
  errorMessage?: any;
  isInvalid?: boolean;
  size?: "lg" | "md" | "sm";
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
  autoComplete?: string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const CustomInput = ({
  type = "text",
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
  classnames = "bg-none rounded-[6px] shadow-none  hover:border-[#C3ADFF] focus:border-[#C3ADFF]",
  errorMessage,
  isInvalid,
  size = "lg",
  min,
  max,
  autoComplete,
  onFocus,
}: CustomInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  const passwordType = isVisible ? "text" : "password";
  const passwordEndContent = (
    <button
      className="focus:outline-none"
      type="button"
      onClick={toggleVisibility}
    >
      {isVisible ? (
        <IoEyeOutline className="text-foreground-500 text-lg" />
      ) : (
        <IoEyeOffOutline className="text-foreground-500 text-lg" />
      )}
    </button>
  );

  const handleCopy = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === "password") {
      event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === "password") {
      event.preventDefault();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Call the passed onFocus handler if provided
    if (onFocus) {
      onFocus(e);
    }

    // Scroll the input into view on mobile devices
    // Add a small delay to account for keyboard animation
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300);
  };

  return (
    <div ref={inputRef}>
      <Input
      key="outside"
      type={type === "password" ? passwordType : type}
      label={label}
      value={value}
      name={name}
      hidden={hidden}
      disabled={disabled}
      onChange={onChange}
      defaultValue={defaultValue}
      variant="bordered"
      classNames={{
        label: "text-[#000] font-[500] text-[14px]",
        base: "bg-none",
        inputWrapper: [
          `${classnames} ${disabled ? "bg-secondaryGrey" : "bg-white"} `,
        ],
        innerWrapper: `bg-none border-none`,
        input: ["bg-none", "text-black placeholder:text-[14px] bg-none"],
      }}
      autoCorrect="off"
      placeholder={placeholder}
      labelPlacement="outside"
      isRequired={isRequired}
      spellCheck="false"
      ng-model="name"
      autoComplete={autoComplete || "new-password"}
      errorMessage={errorMessage}
      isInvalid={isInvalid || (errorMessage && true)}
      size={size}
      endContent={type === "password" ? passwordEndContent : endContent}
      startContent={startContent}
      onCopy={handleCopy}
      onPaste={handlePaste}
      onFocus={handleFocus}
      min={min}
      max={max}
    />
    </div>
  );
};
