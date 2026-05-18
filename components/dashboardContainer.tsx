'use client';

import { useCallback, useEffect, useState } from 'react';

import { useActivityTracking } from '@/hooks/useActivityTracking';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isPOSUser as checkIsPOSUser, isCategoryUser as checkIsCategoryUser } from '@/lib/userTypeUtils';
import Header from './ui/dashboard/header';
import HeaderMobile from './ui/dashboard/header-mobile';
import MarginWidthWrapper from './ui/dashboard/margin-width-wrapper';
import PageWrapper from './ui/dashboard/page-wrapper';
import SideNav from './ui/dashboard/side-nav';

const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

function Container({ children }: any) {
  useActivityTracking();

  // Hide sidebar for POS users and Category users
  const userInfo = getJsonItemFromLocalStorage('userInformation');
  const isPOSUser = checkIsPOSUser(userInfo);
  const isCategoryUser = checkIsCategoryUser(userInfo);
  const shouldHideSidebar = isPOSUser || isCategoryUser;

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === 'true') setIsCollapsed(true);
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore localStorage write errors
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {!shouldHideSidebar && (
        <SideNav isCollapsed={isCollapsed} onToggleCollapsed={toggleSidebar} />
      )}
      <main className="flex-1 w-full overflow-y-auto">
        <MarginWidthWrapper
          shouldHideSidebar={shouldHideSidebar}
          isCollapsed={isCollapsed}
        >
          <Header ispos={isPOSUser} />
          <HeaderMobile />
          <PageWrapper>{children}</PageWrapper>
        </MarginWidthWrapper>
      </main>
    </div>
  );
}

export default Container;
