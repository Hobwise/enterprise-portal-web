import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import { LoadingReservations } from '@/components/ui/landingPage/skeleton-loading';
import { companyInfo } from '@/lib/companyInfo';
import { ReactNode, Suspense } from 'react';

export const metadata = {
  title: companyInfo.name + ' | Reservations',
  description: 'Streamline your business processes',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-white">
      <header className="z-[50] backdrop-filter backdrop-blur-md fixed w-full">
        <LandingPageHeader />
        <Navbar type="default" />
      </header>
      <Suspense fallback={<LoadingReservations />}>
        <div className="pt-24 pb-6">{children}</div>
      </Suspense>
    </div>
  );
}
