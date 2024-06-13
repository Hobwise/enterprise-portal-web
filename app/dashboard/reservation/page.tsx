'use client';
import Container from '../../../components/dashboardContainer';

import React, { useMemo, useState } from 'react';

import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoSearchOutline } from 'react-icons/io5';

import Error from '@/components/error';
import CreateReservation from '@/components/ui/dashboard/reservations/createReservations';
import ReservationList from '@/components/ui/dashboard/reservations/reservation';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import { CustomLoading } from '@/lib/utils';
import { IoMdAdd } from 'react-icons/io';
import { VscCopy } from 'react-icons/vsc';

const Reservation: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useReservation();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data
      ?.filter(
        (item) =>
          item?.reservationName?.toLowerCase().includes(searchQuery) ||
          String(item?.reservationFee)?.toLowerCase().includes(searchQuery) ||
          String(item?.minimumSpend)?.toLowerCase().includes(searchQuery) ||
          String(item?.quantity)?.toLowerCase().includes(searchQuery) ||
          item?.reservationDescription?.toLowerCase().includes(searchQuery)
      )
      .filter((item) => Object.keys(item).length > 0);
  }, [data, searchQuery]);

  const getScreens = () => {
    if (data?.length > 0) {
      return (
        <ReservationList
          reservation={filteredItems}
          searchQuery={searchQuery}
        />
      );
    } else if (isError) {
      return <Error onClick={() => refetch()} />;
    } else {
      return <CreateReservation />;
    }
  };

  // const newArray = data?.map((item) => {
  //   return {
  //     allOrder: item.allOrdersCount,
  //     openOrder: item.openOrdersCount,

  //     dateCreated: item.dateCreated,

  //     name: item.name,
  //   };
  // });

  return (
    <Container>
      <div className='flex flex-row flex-wrap xl:mb-8 mb-4 justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            <div className='flex items-center'>
              <span>Reservation</span>

              {data?.length > 0 && (
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.length}
                </Chip>
              )}
            </div>
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] w-full '>
            Showing all Reservations
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {data?.length > 0 && (
            <>
              <div>
                <CustomInput
                  classnames={'w-[242px]'}
                  label=''
                  size='md'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isRequired={false}
                  startContent={<IoSearchOutline />}
                  type='text'
                  placeholder='Search here...'
                />
              </div>
              <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-xl'>
                <Button
                  // onClick={() => downloadCSV(newArray)}
                  className='flex text-grey600 bg-white'
                >
                  <VscCopy />
                  <p>Copy link</p>
                </Button>
              </ButtonGroup>
            </>
          )}

          {data?.length > 0 && (
            <CustomButton
              onClick={() =>
                router.push('/dashboard/reservation/create-reservation')
              }
              className='py-2 px-4 md:mb-0 mb-4 text-white'
              backgroundColor='bg-primaryColor'
            >
              <div className='flex gap-2 items-center justify-center'>
                <IoMdAdd className='text-[22px]' />

                <p>Add reservation</p>
              </div>
            </CustomButton>
          )}
        </div>
      </div>

      {isLoading ? <CustomLoading /> : <>{getScreens()} </>}
    </Container>
  );
};

export default Reservation;
