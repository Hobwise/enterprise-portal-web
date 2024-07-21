'use client';

import Error from '@/components/error';
import useSingleReservation from '@/hooks/cachedEndpoints/useSingleReservation';
import { useGlobalContext } from '@/hooks/globalProvider';
import useTextCopy from '@/hooks/useTextCopy';
import {
  CustomLoading,
  formatPrice,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { VscCopy } from 'react-icons/vsc';
import noImage from '../../../../public/assets/images/no-image.svg';
import Booking from './booking';
import DeleteReservation from './deleteReservation';
import EditReservation from './editReservation';

const ReservationDetails = () => {
  const searchParams = useSearchParams();
  const business = getJsonItemFromLocalStorage('business');

  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const reservationId = searchParams.get('reservationId') || null;

  const { data, isLoading, isError, refetch } =
    useSingleReservation(reservationId);

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus('All');
    setPage(1);
  }, []);

  const toggleModalDelete = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };

  if (isError) {
    return <Error onClick={() => refetch()} />;
  }

  const { handleCopyClick, isOpen, setIsOpen } = useTextCopy(
    `https://hobink-corporate-web.vercel.app/reservation/select-reservation/single-reservation?businessName=${business[0]?.businessName}&businessId=${business[0]?.businessId}&cooperateID=${userInformation.cooperateID}&reservationId=${reservationId}`
  );

  return (
    <>
      <div className='lg:flex block justify-between'>
        <Link
          href={'/dashboard/reservation'}
          className={`cursor-pointer text-primaryColor flex gap-2 lg:mb-0 mb-2 text-sm items-center`}
        >
          <IoIosArrowRoundBack className='text-[22px]' />
          <span className='text-sm'>Back to reservations</span>
        </Link>
        <div className='gap-6 lg:flex block'>
          <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
            <Button
              onClick={toggleModalEdit}
              className='flex text-grey600 bg-white'
            >
              <FaEdit className='text-[18px]' />
              <p>Edit</p>
            </Button>

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

            <Button
              onClick={toggleModalDelete}
              className='flex text-grey600 bg-white'
            >
              <RiDeleteBin6Line className='text-[18px]' />
              <p>Delete</p>
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <Spacer y={5} />
      {isLoading ? (
        <CustomLoading />
      ) : (
        <section className='flex flex-col flex-grow'>
          <div className='flex lg:flex-row flex-col gap-3 justify-between '>
            <div className='space-y-2 lg:w-[500px] w-full'>
              <h2 className='text-black font-[600]  text-[28px]'>
                {data?.reservationName}
              </h2>
              <p className='text-[#3D424A] text-[14px] font-[400]'>
                {data?.reservationDescription}
              </p>
              <div className='flex lg:gap-3 gap-0 lg:flex-row flex-col'>
                <div className='flex gap-2  text-[14px] font-[400]'>
                  <p className='text-[#3D424A]'>RESERVATION FEE</p>
                  <p className='text-[#3D424A] font-bold'>
                    {data?.reservationFee
                      ? formatPrice(data?.reservationFee)
                      : formatPrice(0)}
                  </p>
                </div>
                <div className='flex gap-2  text-[14px] font-[400]'>
                  <p className='text-[#3D424A]'>MINIMUM SPEND</p>
                  <p className='text-[#3D424A] font-bold'>
                    {data?.minimumSpend
                      ? formatPrice(data?.minimumSpend)
                      : formatPrice(0)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Image
                src={
                  data?.image
                    ? `data:image/jpeg;base64,${data?.image}`
                    : noImage
                }
                width={60}
                height={60}
                style={{
                  objectFit: data?.image ? 'cover' : 'contain',
                }}
                className={'bg-contain border  h-[100px] rounded-lg w-[159px]'}
                aria-label='reservation image'
                alt='reservation image'
              />
            </div>
          </div>
          <Spacer y={5} />
          <Booking
            isLoading={isLoading}
            isError={isError}
            reservationItem={data}
            getSingleReservation={refetch}
          />
        </section>
      )}
      <DeleteReservation
        reservationItem={data}
        isOpenDelete={isOpenDelete}
        toggleModalDelete={toggleModalDelete}
      />
      <EditReservation
        getReservation={refetch}
        reservationItem={data}
        isOpenEdit={isOpenEdit}
        toggleModalEdit={toggleModalEdit}
      />
    </>
  );
};

export default ReservationDetails;
