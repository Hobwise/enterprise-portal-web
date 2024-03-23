import React, { ReactNode } from 'react';

import SideNav from './ui/dashboard/side-nav';
import MarginWidthWrapper from './ui/dashboard/margin-width-wrapper';
import Header from './ui/dashboard/header';
import HeaderMobile from './ui/dashboard/header-mobile';
import PageWrapper from './ui/dashboard/page-wrapper';

function Container({ children }: any) {
  return (
    <div>
      <div className='flex'>
        <SideNav />
        <main className='flex-1'>
          <MarginWidthWrapper>
            <Header />
            <HeaderMobile />
            <PageWrapper>{children}</PageWrapper>
          </MarginWidthWrapper>
        </main>
      </div>
    </div>
  );
}

export default Container;
