'use client';
import Airbnb from '@/public/assets/icons/airbnb-2.png';
import Hubspot from '@/public/assets/icons/hubspot-2.png';
import Google from '@/public/assets/icons/google-2.png';
import Microsoft from '@/public/assets/icons/microsoft-2.png';
import FedEx from '@/public/assets/icons/fedex-2.png';
import { cn, notify } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { getCompanies } from '@/app/api/controllers/landingPage';

export default function Companies() {
  const [isLoading, setIsLoading] = useState(true);

  const initialCompanies = [
    { image: Airbnb, title: 'Airbnb' },
    { image: Hubspot, title: 'Hubspot' },
    { image: Google, title: 'Google' },
    { image: Microsoft, title: 'Microsoft' },
    { image: FedEx, title: 'FedEx' },
  ];

  const [companies, setCompanies] = useState<{ image: any; title: string | null }[]>([]);

  const getAllCompanies = async (loading = true) => {
    setIsLoading(loading);
    const data = await getCompanies();
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      const updatedCompanies = data?.data?.data?.filter((logo: any) => logo).map((each: any) => ({ image: each, title: '' }));

      setCompanies(updatedCompanies);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getAllCompanies();
  }, []);

  return (
    <React.Fragment>
      {/* {type === 'all' ? ( */}
      {isLoading ? (
        <div className="h-24" />
      ) : (
        <>
          {companies.map((logo, index) => (
            <li key={index}>
              <img
                src={logo.title ? logo.image.src : `data:image/jpeg;base64,${logo.image}`}
                alt={logo.title || ''}
                className="w-[60px] lg:w-[120px] z-50"
                loading="lazy"
              />
            </li>
          ))}
        </>
      )}
      {/* ) : (
        <div className={cn('grid gap-10 w-[50%] items-center mx-auto grid-cols-5', className)}>
          {initialCompanies.map((each, index) => (
            <img src={each.title ? each.image.src : `data:image/jpeg;base64,${each.image}`} alt={each.title || ''} key={each.title || index} />
          ))}
        </div>
      )} */}
    </React.Fragment>
  );
}
