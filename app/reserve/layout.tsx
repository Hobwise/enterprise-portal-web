import { companyInfo } from '@/lib/companyInfo';
import { ReactNode } from 'react';

export const metadata = {
  title: companyInfo.name + ' | Reservation',
  description: 'Streamline your business processes',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
