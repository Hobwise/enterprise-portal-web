'use client';
import React, { useState } from 'react';
import {
  getInitials,
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getBusinessDetails } from '@/app/api/controllers/auth';
import { Spinner } from '@nextui-org/react';
const SelectBusinessForm = () => {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getBusiness = getJsonItemFromLocalStorage('userInformation');

  const handleSelectedBusiness = async (item: any) => {
    setIsLoading(true);

    setBusiness(item);
    const data = await getBusinessDetails(item);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      saveJsonItemToLocalStorage('business', [data?.data?.data]);
      router.push('/dashboard');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  return (
    <div
      className={`gap-3 grid  grid-cols-1 ${
        getBusiness?.businesses?.length === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-3'
      } `}
    >
      {getBusiness?.businesses?.map((item: any) => {
        return (
          <div
            onClick={() => handleSelectedBusiness(item)}
            key={item.businessName}
          >
            <div className='flex flex-col items-center justify-center rounded-2xl border-[#EFEFEF]  border p-9 cursor-pointer '>
              <div className='w-[64px] rounded-full text-[24px] font-[500] grid place-content-center text-black bg-[#EAE5FF] h-[64px]'>
                {isLoading && item.businessName === business?.businessName ? (
                  <Spinner size='sm' />
                ) : (
                  getInitials(item.businessName)
                )}
              </div>
            </div>
            {isLoading && item.businessName === business?.businessName ? (
              <p className='text-xs text-grey500 text-center whitespace-nowrap mt-2'>
                Fetching business...
              </p>
            ) : (
              <p className='text-center font-[500] pt-1'>{item.businessName}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SelectBusinessForm;
