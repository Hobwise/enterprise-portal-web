import Navbar from '@/components/ui/landingPage/navBar';
import { companyInfo } from '@/lib/companyInfo';
import { ReactNode } from 'react';

export const metadata = {
  title: companyInfo.name + ' | Businesses',
  description: 'Streamline your business processes',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-white">
      <header className="z-[50] backdrop-filter backdrop-blur-md fixed w-full">
        <Navbar type="default" />
      </header>
      <div className="pt-20 pb-10">{children}</div>
    </div>
  );
}
