import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import { Skeleton } from '@/components/ui/landingPage/skeleton-loading';
import { companyInfo } from '@/lib/companyInfo';
import { ReactNode, Suspense } from 'react';

export const metadata = {
  title: companyInfo.name + ' | Privacy Policy',
  description: 'Streamline your business processes',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 py-4 bg-white h-screen" id="wrapper">
      <header className="z-[100] w-full top-0 lg:mx-auto font-satoshi fixed bg-white backdrop-filter backdrop-blur-md right-0 left-0" id="header">
        <LandingPageHeader />
        <Navbar className="bg-none py-4 lg:py-2" type="default" />
      </header>

      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <div className="text-[#000000CC]" id="content">
          {children}
        </div>
      </Suspense>
    </div>
  );
}
