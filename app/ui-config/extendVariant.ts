import { Input, extendVariants } from '@nextui-org/react';
export const ExtendedInput = extendVariants(Input, {
  variants: {
    color: {
      stone: {
        inputWrapper: [
          'bg-zinc-100',
          'border',

          'transition-colors',
          'focus-within:bg-zinc-100',
          'data-[hover=true]:border-primary100',
          'data-[hover=true]:bg-zinc-100',
          'group-data-[focus=true]:border-primary100',

          'dark:bg-zinc-900',
          'dark:border-zinc-800',
          'dark:data-[hover=true]:bg-primary100',
          'dark:focus-within:bg-primary100',
        ],
        input: [
          'text-zinc-800',
          'placeholder:text-zinc-600',

          'dark:text-zinc-400',
          'dark:placeholder:text-zinc-600',
        ],
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
        inputWrapper: 'h-unit-14 min-h-unit-14',
        input: 'text-medium',
      },
    },
    radius: {
      xs: {
        inputWrapper: 'rounded',
      },
      sm: {
        inputWrapper: 'rounded-[4px]',
      },
      mdextra: {
        inputWrapper: 'rounded-[6px]',
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
