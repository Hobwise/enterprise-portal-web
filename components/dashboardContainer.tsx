'use client';

import { useActivityTracking } from '@/hooks/useActivityTracking';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { usePathname } from 'next/navigation';
import Header from './ui/dashboard/header';
import HeaderMobile from './ui/dashboard/header-mobile';
import MarginWidthWrapper from './ui/dashboard/margin-width-wrapper';
import PageWrapper from './ui/dashboard/page-wrapper';
import SideNav from './ui/dashboard/side-nav';

function Container({ children }: any) {
  useActivityTracking();
  const pathname = usePathname();
  const { role } = usePermission();

  // Hide sidebar for POS users (role === 1) on orders page
  const isPOSUser = role === 1;
  const isOrdersPage = pathname === '/dashboard/orders';
  const shouldHideSidebar = isPOSUser && isOrdersPage;

  return (
    <div className="flex h-screen overflow-hidden">
      {!shouldHideSidebar && <SideNav />}
      <main className="flex-1 w-full overflow-y-auto">
        <MarginWidthWrapper shouldHideSidebar={shouldHideSidebar}>
          <Header />
          <HeaderMobile />
          <PageWrapper>{children}</PageWrapper>
        </MarginWidthWrapper>
      </main>
    </div>
  );
}

export default Container;
