import LandingNav from '@/components/ui/landingPage/v2/nav';
import { Skeleton } from '@/components/ui/landingPage/skeleton-loading';
import { companyInfo } from '@/lib/companyInfo';
import { ReactNode, Suspense } from 'react';

export const metadata = {
  title: companyInfo.name + ' | Privacy Policy',
  description: 'Streamline your business processes',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white h-screen" id="wrapper">
      <LandingNav />

      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <div className="text-[#000000CC]" id="content">
          {children}
        </div>
      </Suspense>
    </div>
  );
}
