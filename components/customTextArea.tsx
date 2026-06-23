"use client";
import { useState } from "react";
import { Textarea } from "@nextui-org/react";

interface CustomTextProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  errorMessage?: any;
  size?: "lg" | "md" | "sm";
  classnames?: string;
  placeholder?: string;
  isRequired?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  /** Min/max visible rows. Defaults to NextUI's (3/8); set both to 1 for a single line. */
  minRows?: number;
  maxRows?: number;
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
  classnames = "bg-none rounded-[6px] shadow-none hover:border-[#C3ADFF] focus:border-[#C3ADFF]",
  errorMessage,
  size = "lg",
  maxLength = 100,
  minRows,
  maxRows,
}: CustomTextProps) => {
  const [currentLength, setCurrentLength] = useState(value?.length || 0);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = (event.target as HTMLTextAreaElement).value;
    setCurrentLength(inputValue.length);

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="relative">
      <Textarea
        key="outside"
        label={label}
        value={value}
        defaultValue={defaultValue}
        name={name}
        hidden={hidden}
        disabled={disabled}
        onChange={
          handleChange as unknown as React.ChangeEventHandler<HTMLInputElement>
        }
        variant="bordered"
        classNames={{
          label: "text-[#000] font-[500] text-[14px]",
          base: "bg-none",
          inputWrapper: [
            `${classnames} ${disabled ? "bg-secondaryGrey" : "bg-white"} `,
          ],
          innerWrapper: "bg-none border-none",
          input: ["bg-none", "text-black placeholder:text-[14px]"],
        }}
        aria-haspopup="false"
        autoCorrect="off"
        placeholder={placeholder}
        labelPlacement="outside"
        isRequired={isRequired}
        spellCheck="false"
        ng-model="name"
        maxLength={maxLength}
        autoComplete="new-password"
        errorMessage={errorMessage}
        isInvalid={errorMessage && true}
        size={size}
        minRows={minRows}
        maxRows={maxRows}
      />
      <p className="text-xs float-right text-primaryColor">
        {maxLength - currentLength} character(s)
      </p>
    </div>
  );
};
