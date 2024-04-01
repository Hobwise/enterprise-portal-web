import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      secondaryColor: '#7C69D8',
      white: '#fff',
      black: '#000',
      primaryColor: '#5F35D2',
      primary100: '#C3ADFF',
      grey400: '#98A2B3',
      grey500: '#667185',
      grey600: '#645D5D',
      pink200: '#EAE5FF',
      primaryGrey: '#F0F2F5',
      secondaryGrey: '#E4E7EC',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      layout: {
        disabledOpacity: '0.3',
        radius: {
          large: '8px',
        },

        borderWidth: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
      },
      colors: {
        primary: {
          DEFAULT: '#BEF264',
          foreground: '#000000',
        },
        placeholder: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
        focus: '#C3ADFF',
        hover: '#C3ADFF',
      },
      themes: {
        light: {},
        dark: {},
      },
    }),
  ],
};
