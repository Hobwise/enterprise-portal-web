import { nextui } from '@nextui-org/react';
import { Bricolage_Grotesque } from 'next/font/google';

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
      textGrey: '#475367',
      primary100: '#C3ADFF',
      grey400: '#98A2B3',
      grey500: '#667185',
      grey600: '#645D5D',
      dark: '#44444A',
      pink200: '#EAE5FF',
      primaryGrey: '#F0F2F5',
      secondaryGrey: '#E4E7EC',
      navColor: '#616B7C',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        satoshi: ['Satoshi'], // Define your custom font
        bricolage_grotesque: ['Bricolage Grotesque']
      },
      boxShadow: {
        'custom': '0px 4px 12px 0px rgba(49, 54, 63, 0.1)',
        'custom-inset': '0px 7.4px 18.5px 0px rgba(255, 255, 255, 0.11) inset',
        'custom_shadow': '0px 12px 27px 0px rgba(16, 24, 40, 0.07)',
        'custom_double': 'inset 0px 7.4px 18.5px rgba(255, 255, 255, 0.11), 0px 0px 0px 3.7px rgba(190, 202, 234, 0.03)',
        'custom_inset_2': 'inset 0px 7.4px 18.5px 0px #FFFFFF1C, 0px 0px 0px 3.7px #BECAEA08',
        'custom_inset_3': 'box-shadow: 0px 67.4px 98.5px 0px #FFFFFF0D inset',
        'custom_inset_4': 'inset 0px 7.4px 18.5px 0px rgba(255, 255, 255, 0.11)',
        'custom_shadow_2': 'box-shadow: 0px 7.4px 18.5px 0px #FFFFFF1C inset',
        'custom_shadow_3': '-4.69px 7.03px 4.69px 0px rgba(0, 0, 0, 0.06)'
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
        primaryColor: {
          DEFAULT: '#F0F2F5',
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
