'use client';

import { useActivityTracking } from '@/hooks/useActivityTracking';
import Header from './ui/dashboard/header';
import HeaderMobile from './ui/dashboard/header-mobile';
import MarginWidthWrapper from './ui/dashboard/margin-width-wrapper';
import PageWrapper from './ui/dashboard/page-wrapper';
import SideNav from './ui/dashboard/side-nav';

function Container({ children }: any) {
  useActivityTracking();
  return (
    <div className="flex">
      <SideNav />
      <main className="flex-1 w-full">
        <MarginWidthWrapper>
          <Header />
          <HeaderMobile />
          <PageWrapper>{children}</PageWrapper>
        </MarginWidthWrapper>
      </main>
    </div>
  );
}

export default Container;
