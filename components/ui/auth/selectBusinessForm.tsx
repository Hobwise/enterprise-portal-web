'use client';
import { getBusinessDetails } from '@/app/api/controllers/auth';
import useGetBusiness from '@/hooks/cachedEndpoints/useGetBusiness';
import {
  SmallLoader,
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import { Avatar } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
const SelectBusinessForm = () => {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useGetBusiness();

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
    <div className={`flex flex-col gap-3 w-full`}>
      {getBusiness?.businesses?.map((item: any) => {
        return (
          <article
            className={`bg-[#F1F2F480] rounded-xl p-3 cursor-pointer ${
              isLoading &&
              item.businessName === business?.businessName &&
              'border-grey500 border'
            }`}
            onClick={() => handleSelectedBusiness(item)}
            key={item.businessName}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar
                  showFallback={true}
                  size='lg'
                  src={`data:image/jpeg;base64,${data?.logoImage}`}
                  name={item?.businessName}
                />
                <div className='flex flex-col'>
                  <span className='font-[600] text-[14px]'>
                    {item?.businessName}
                  </span>

                  <span className='text-[12px] font-[400]'>{item?.city}</span>
                </div>
              </div>
              {isLoading && item.businessName === business?.businessName && (
                <SmallLoader />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default SelectBusinessForm;
