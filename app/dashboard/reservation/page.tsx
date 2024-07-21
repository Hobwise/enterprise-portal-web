'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import {
  Button,
  ButtonGroup,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoSearchOutline } from 'react-icons/io5';

import Error from '@/components/error';
import CreateReservation from '@/components/ui/dashboard/reservations/createReservations';
import ReservationList from '@/components/ui/dashboard/reservations/reservation';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import { useGlobalContext } from '@/hooks/globalProvider';
import useTextCopy from '@/hooks/useTextCopy';
import { CustomLoading, getJsonItemFromLocalStorage } from '@/lib/utils';
import { IoMdAdd } from 'react-icons/io';
import { VscCopy } from 'react-icons/vsc';

const Reservation: React.FC = () => {
  const router = useRouter();
  const business = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const { data, isLoading, isError, refetch } = useReservation();

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus('All');
    setPage(1);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data?.reservations
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
    if (data?.reservations?.length > 0) {
      return (
        <ReservationList
          data={data}
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
  const { handleCopyClick, isOpen, setIsOpen } = useTextCopy(
    `https://hobink-corporate-web.vercel.app/reservation/select-reservation?businessName=${business[0]?.businessName}&businessId=${business[0]?.businessId}&cooperateID=${userInformation.cooperateID}`
  );
  return (
    <>
      <div className='flex flex-row flex-wrap xl:mb-8 mb-4 justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            <div className='flex items-center'>
              <span>Reservation</span>

              {data?.reservations?.length > 0 && (
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.totalCount}
                </Chip>
              )}
            </div>
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] w-full '>
            Showing all Reservations
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {data?.reservations?.length > 0 && (
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
                <Popover
                  showArrow={true}
                  isOpen={isOpen}
                  onOpenChange={(open) => setIsOpen(open)}
                >
                  <PopoverTrigger>
                    <Button
                      onClick={handleCopyClick}
                      className='flex text-grey600 bg-white'
                    >
                      <VscCopy />
                      <p>Copy link</p>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className='text-small text-black'>
                      Reservation url copied!
                    </div>
                  </PopoverContent>
                </Popover>
              </ButtonGroup>
            </>
          )}

          {data?.reservations?.length > 0 && (
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
    </>
  );
};

export default Reservation;
