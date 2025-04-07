'use client';
import React, { useEffect, useState } from 'react';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { RESERVATIONS_URL } from '@/utilities/routes';
import BookReservationPage from './book-reservation';
import { ArrowLeftIcon, ArrowRightIcon } from '@/public/assets/svg';

export default function BookReservation() {
  const { back } = useRouter();
  const pathname = usePathname();
  const pathnameLength = pathname.split('/').length;
  const [reservation, setReservation] = useState<any>(null);
  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    const reservation = typeof window !== 'undefined' && localStorage.getItem('reservation');
    if (reservation) {
      setReservation(JSON.parse(reservation));
    } else {
      redirect(RESERVATIONS_URL);
    }
    setLoading(false);
  }, []);

  return (
    <div className="mt-28 px-6 lg:px-24 space-y-4">
      <div className="flex items-center space-x-2.5 text-sm">
        <div className="bg-[#EDE7FD] border border-[#5F35D24D] rounded-md w-8 h-8 flex items-center justify-center" role="button" onClick={() => back()}>
          <ArrowLeftIcon width={20} height={20} />
        </div>

        <div className="flex items-center space-x-2.5">
          <p onClick={() => back()} role="button" className="text-[#848E9F]">
            Reservations
          </p>
          <ArrowRightIcon width={20} height={20} />
        </div>
        <p className="font-bold text-[#848E9F] capitalize" role="button">
          {reservation?.businessName || ''}
        </p>
        {pathnameLength === 4 && (
          <React.Fragment>
            <ArrowRightIcon width={20} height={20} />
            <p className="font-bold text-[#161618]">Book Reservation</p>
          </React.Fragment>
        )}
      </div>
      {!Loading && <BookReservationPage reservation={reservation} className="px-0 lg:px-0" />}
    </div>
  );
}
