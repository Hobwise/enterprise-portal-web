'use client';
import { ArrowLeftIcon, ArrowRightIcon } from '@/public/assets/svg';
import { BUSINESS_URL } from '@/utilities/routes';
import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { back, push } = useRouter();
  const pathname = usePathname();
  const pathnameLength = pathname.split('/').length;

  return (
    <div className="font-satoshi px-24 space-y-8 mt-8 text-[]">
      <div className="flex items-center space-x-2.5 text-sm">
        <div className="bg-[#EDE7FD] border border-[#5F35D24D] rounded-md w-8 h-8 flex items-center justify-center" role="button" onClick={() => back()}>
          <ArrowLeftIcon width={20} height={20} />
        </div>

        <div className="flex items-center space-x-2.5">
          <p onClick={() => push(`/${BUSINESS_URL}`)} role="button" className="text-[#848E9F]">
            Customer
          </p>
          <ArrowRightIcon width={20} height={20} />
        </div>
        <p className="font-bold text-[#848E9F]" onClick={() => back()} role="button">
          Zapier
        </p>
        {pathnameLength === 4 && (
          <React.Fragment>
            <ArrowRightIcon width={20} height={20} />
            <p className="font-bold text-[#161618]">Book Reservation</p>
          </React.Fragment>
        )}
      </div>
      {children}
    </div>
  );
}
