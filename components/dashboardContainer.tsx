'use client';

import { useActivityTracking } from '@/hooks/useActivityTracking';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isPOSUser as checkIsPOSUser, isCategoryUser as checkIsCategoryUser } from '@/lib/userTypeUtils';
import Header from './ui/dashboard/header';
import HeaderMobile from './ui/dashboard/header-mobile';
import MarginWidthWrapper from './ui/dashboard/margin-width-wrapper';
import PageWrapper from './ui/dashboard/page-wrapper';
import SideNav from './ui/dashboard/side-nav';

function Container({ children }: any) {
  useActivityTracking();

  // Hide sidebar for POS users and Category users
  const userInfo = getJsonItemFromLocalStorage('userInformation');
  const isPOSUser = checkIsPOSUser(userInfo);
  const isCategoryUser = checkIsCategoryUser(userInfo);
  const shouldHideSidebar = isPOSUser || isCategoryUser;

  return (
    <div className="flex h-screen overflow-hidden">
      {!shouldHideSidebar && <SideNav />}
      <main className="flex-1 w-full overflow-y-auto">
        <MarginWidthWrapper shouldHideSidebar={shouldHideSidebar}>
          <Header ispos={isPOSUser} />
          <HeaderMobile />
          <PageWrapper>{children}</PageWrapper>
        </MarginWidthWrapper>
      </main>
    </div>
  );
}

export default Container;
