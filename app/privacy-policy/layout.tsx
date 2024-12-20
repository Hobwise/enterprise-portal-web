import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import { Skeleton } from '@/components/ui/landingPage/skeleton-loading';
import { ReactNode, Suspense } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 py-4 bg-white h-screen">
      <header className="z-[100] w-full top-0 lg:mx-auto font-satoshi fixed bg-white backdrop-filter backdrop-blur-md right-0 left-0">
        <LandingPageHeader />
        <Navbar className="bg-none py-4 lg:py-2" type="default" />
      </header>

      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <div className="text-[#000000CC]">{children}</div>
      </Suspense>
    </div>
  );
}
