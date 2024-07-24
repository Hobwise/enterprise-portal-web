'use client';
import { getBusinessDetails } from '@/app/api/controllers/auth';
import useGetBusinessByCooperate from '@/hooks/cachedEndpoints/useGetBusinessByCooperate';
import { useGlobalContext } from '@/hooks/globalProvider';
import {
  SmallLoader,
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import { Avatar, Pagination } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const INITIAL_VISIBLE_COLUMNS = [
  'reservationName',
  'reservationDescription',
  'reservationFee',
  'quantity',
  'minimumSpend',
  'actions',
];
const columns = [
  { name: 'ID', uid: 'id' },
  { name: 'Reservation', uid: 'reservationName' },
  { name: 'Quantity', uid: 'quantity' },
  { name: 'Description', uid: 'reservationDescription' },
  { name: '', uid: 'actions' },
];

const SelectBusinessForm = () => {
  const router = useRouter();
  const { page, setPage, rowsPerPage, setRowsPerPage } = useGlobalContext();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: loading } = useGetBusinessByCooperate();
  const refinedArrayToMap = data ? data?.totalPages : 1;

  console.log(data, 'getBusiness');

  const getBusiness = getJsonItemFromLocalStorage('userInformation');

  const handleSelectedBusiness = async (item: any) => {
    console.log(item, 'item');
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
  if (loading) {
    return (
      <div className='grid place-content-center'>
        <SmallLoader />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 w-full`}>
      {data?.map((item: any) => {
        return (
          <article
            className={`bg-[#F1F2F480] rounded-xl p-3 cursor-pointer ${
              isLoading &&
              item.name === business?.name &&
              'border-grey500 border'
            }`}
            onClick={() => handleSelectedBusiness(item)}
            key={item.name}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar
                  showFallback={true}
                  size='lg'
                  src={`data:image/jpeg;base64,${item?.logoImage}`}
                  name={item?.name}
                />
                <div className='flex flex-col'>
                  <span className='font-[600] text-[14px]'>{item?.name}</span>

                  <span className='text-[12px] font-[400]'>{item?.city}</span>
                </div>
              </div>
              {isLoading && item.name === business?.name && <SmallLoader />}
            </div>
          </article>
        );
      })}
      {data?.length > 10 && (
        <div className='flex justify-end mt-1'>
          <Pagination
            disableCursorAnimation
            showControls
            size='sm'
            page={page}
            total={refinedArrayToMap}
            onChange={setPage}
            className='gap-2'
            radius='full'
            variant='light'
          />
        </div>
      )}
    </div>
  );
};

export default SelectBusinessForm;
