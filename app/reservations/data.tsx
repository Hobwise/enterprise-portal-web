import { CompanyLogo_1, CompanyLogo_2, CompanyLogo_3 } from '@/public/assets/svg';
import Bottle from '@/public/assets/images/bottle-2.png';

export const allReservations: {
  logo: any;
  company_name: string;
  reservation: { product_image: any; fee: string; type: string };
  quantity: number;
  minimum_spend: string;
  description: string;
}[] = [
  {
    logo: <CompanyLogo_3 width={28} />,
    company_name: 'Company Name_1',
    reservation: {
      product_image: Bottle,
      fee: '20,000.00',
      type: 'Table for 3',
    },
    quantity: 3,
    minimum_spend: '20,000.00',
    description: "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
  },
  {
    logo: <CompanyLogo_2 width={28} />,
    company_name: 'Company Name_2',
    reservation: {
      product_image: Bottle,
      fee: '20,000.00',
      type: 'Table for 3',
    },
    quantity: 1,
    minimum_spend: '20,000.00',
    description: "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
  },
  {
    logo: <CompanyLogo_1 width={28} />,
    company_name: 'Company Name_3',
    reservation: {
      product_image: Bottle,
      fee: '20,000.00',
      type: 'VIP',
    },
    quantity: 4,
    minimum_spend: '20,000.00',
    description: "Founded in 1743, Moët & Chandon celebrates life's memorable moments with a range of unique champagnes for every occasion.",
  },
];

export const companyFilter = [
  {
    logo: <CompanyLogo_1 width={24} height={24} />,
    name: 'Sample Name_1',
  },
  {
    logo: <CompanyLogo_2 width={24} height={24} />,
    name: 'Sample Name_2',
  },
  {
    logo: <CompanyLogo_3 width={24} height={24} />,
    name: 'Sample Name_3',
  },
];
