import { Input, extendVariants } from '@nextui-org/react';

export const ExtendedInput = extendVariants(Input, {
  variants: {
    color: {
      stone: {
        inputWrapper: [
          'bg-none',
          'border',
          'transition-colors',
          'focus-within:bg-none',
          'data-[hover=true]:border-[#C3ADFF]',
          'data-[hover=true]:border-[#C3ADFF]',
          'data-[hover=true]:bg-none',
          'group-data-[focus=true]:border-[#C3ADFF]',
          'dark:border-[#C3ADFF]',
          'dark:data-[hover=true]:bg-none',
          'dark:focus-within:bg-none',
        ],
        input: [
          'text-[#000]',
          'placeholder:text-zinc-500 text-sm',
          'bg-none',
          'dark:text-[#000]',
          'dark:placeholder:text-zinc-500',
        ],
        label: ['text-[#000] text-[14px]'],
      },
    },
    size: {
      xs: {
        inputWrapper: 'h-unit-6 min-h-unit-6 px-1',
        input: 'text-tiny',
      },
      md: {
        inputWrapper: 'h-unit-10 min-h-unit-10',
        input: 'text-small',
      },
      mdextra: {
        inputWrapper: 'h-unit-12 min-h-unit-12',
        input: 'text-small',
      },
      xl: {
        label: 'text-tiny',
        inputWrapper: 'h-unit-14 min-h-unit-14',
        input: 'text-medium',
      },
    },
    radius: {
      xs: {
        inputWrapper: 'rounded',
      },
      sm: {
        inputWrapper: 'rounded-md',
      },
      mdextra: {
        inputWrapper: 'rounded-lg',
      },
    },
    textSize: {
      base: {
        input: 'text-base',
      },
    },
    removeLabel: {
      true: {
        label: 'hidden',
      },
      false: {},
    },
  },
});
