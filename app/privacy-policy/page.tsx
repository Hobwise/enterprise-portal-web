'use client';
import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PrivacyPolicy from './privacy-policy';
import TermsOfUse from './terms-of-use';
import UserGuide from './user-guide';

export default function GeneralPage() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs: string[] = ['Privacy Policy', 'Terms Of Use', 'User Guide'];
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || tabs[0];

  const handleSelectTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);

    if (tab) {
      params.set('tab', tab);
    } else {
      params.delete('tab');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4 py-10 bg-white">
      <header className="z-[100] w-full top-0 lg:mx-auto font-satoshi fixed bg-white backdrop-filter backdrop-blur-md right-0 left-0">
        <LandingPageHeader />
        <Navbar className="bg-none py-4 lg:py-2" type="default" />
      </header>

      <div>
        <div className="border-b w-full flex border-b-[#C4C4C480] space-x-8 px-10 pt-24">
          {tabs.map((tab) => (
            <div
              className={cn(
                'flex items-center text-[#6C7278] border-b border-b-white cursor-pointer px-2 font-satoshi text-sm py-2.5',
                defaultTab === tab && 'text-primaryColor border-b-2 border-b-primaryColor'
              )}
              key={tab}
              role="tab"
              onClick={() => handleSelectTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {defaultTab === tabs[0] && <PrivacyPolicy />}
        {defaultTab === tabs[1] && <TermsOfUse />}
        {defaultTab === tabs[2] && <UserGuide />}
        {tabs.find((each) => each !== defaultTab) && defaultTab !== tabs[0] && defaultTab !== tabs[1] && defaultTab !== tabs[2] && <PrivacyPolicy />}
      </div>
    </div>
  );
}
