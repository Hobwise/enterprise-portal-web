import { ArrowRight, CompanyLogo_1, CompanyLogo_2, CompanyLogo_3 } from '@/public/assets/svg';
import { ReactNode } from 'react';

export const companies: { name: string; type: string; address: string; rating: string; logo: ReactNode }[] = [
  {
    name: 'Company Name',
    type: 'Resturant',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    rating: '5.0',
    logo: <CompanyLogo_1 />,
  },
  {
    name: 'Company Name',
    type: 'Hotel',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    rating: '4.8',
    logo: <CompanyLogo_2 />,
  },
  {
    name: 'Company Name',
    type: 'Bar',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    rating: '5.0',
    logo: <CompanyLogo_3 />,
  },
  {
    name: 'Company Name',
    type: 'Resturant',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    rating: '5.0',
    logo: <CompanyLogo_1 />,
  },
  {
    name: 'Company Name',
    type: 'Hotel',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    rating: '4.8',
    logo: <CompanyLogo_2 />,
  },
  {
    name: 'Company Name',
    type: 'Bar',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    rating: '5.0',
    logo: <CompanyLogo_3 />,
  },
];
