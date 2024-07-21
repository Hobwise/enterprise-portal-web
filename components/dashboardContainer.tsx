'use client';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from './ui/dashboard/header';
import HeaderMobile from './ui/dashboard/header-mobile';
import MarginWidthWrapper from './ui/dashboard/margin-width-wrapper';
import PageWrapper from './ui/dashboard/page-wrapper';
import SideNav from './ui/dashboard/side-nav';

const Msg = () => {
  const router = useRouter();
  return (
    <div>
      <p className='font-bold text-[17px] pb-1'>Complete your profile!</p>
      <div>
        <span
          onClick={() => {
            history.pushState({ prompt: true }, '/dashboard/settings');
            router.push('/dashboard/settings');
          }}
          className='text-primaryColor font-[500]'
        >
          Click here
        </span>{' '}
        to access profile settings and update your business information.
      </div>
    </div>
  );
};
function Container({ children }: any) {
  const businessInformation = getJsonItemFromLocalStorage('business');
  useEffect(() => {
    if (businessInformation[0]?.primaryColor === '') {
      toast.warning(<Msg />, {
        position: 'bottom-right',
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        autoClose: false,
        progress: undefined,
      });
    }
  }, []);
  return (
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
  );
}

export default Container;
