'use client';

import { getReservation } from '@/app/api/controllers/dashboard/reservations';
import Container from '@/components/dashboardContainer';
import {
  CustomLoading,
  formatPrice,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import { Button, ButtonGroup, Spacer } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { VscCopy } from 'react-icons/vsc';
import noImage from '../../../../public/assets/images/no-image.svg';

const ReservationDetails = () => {
  const searchParams = useSearchParams();

  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isOpen, setIsOpen] = useState(false);

  const reservationId = searchParams.get('reservationId') || null;
  const [reservationItem, setReservationItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getMenu = async (loading = true) => {
    setIsLoading(loading);
    const data = await getReservation(reservationId);
    setIsLoading(false);
    console.log(data, 'data');
    if (data?.data?.isSuccessful) {
      setReservationItem(data?.data?.data);
    } else if (data?.data?.error) {
      //   notify({
      //     title: 'Error!',
      //     text: data?.data?.error,
      //     type: 'error',
      //   });
    }
  };

  useEffect(() => {
    getMenu();
  }, []);

  return (
    <Container>
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
              //   onClick={toggleModalEdit}
              className='flex text-grey600 bg-white'
            >
              <FaEdit className='text-[18px]' />
              <p>Edit</p>
            </Button>
            <Button
              //   onClick={toggleModal}
              className='flex text-grey600 bg-white'
            >
              <VscCopy />
              <p>Copy link</p>
            </Button>
            <Button
              //   onClick={toggleModalDelete}
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
        <section>
          <div className='flex lg:flex-row flex-col gap-3 justify-between '>
            <div className='space-y-2'>
              <h2 className='text-black font-[600] text-[28px]'>
                {reservationItem?.reservationName}
              </h2>
              <p className='text-[#3D424A] text-[14px] font-[400]'>
                {reservationItem?.reservationDescription}
              </p>
              <div className='flex lg:gap-3 gap-0 lg:flex-row flex-col'>
                <div className='flex gap-2  text-[14px] font-[400]'>
                  <p className='text-[#3D424A]'>RESERVATION FEE</p>
                  <p className='text-[#3D424A] font-bold'>
                    {formatPrice(reservationItem?.reservationFee)}
                  </p>
                </div>
                <div className='flex gap-2  text-[14px] font-[400]'>
                  <p className='text-[#3D424A]'>MINIMUM SPEND</p>
                  <p className='text-[#3D424A] font-bold'>
                    {formatPrice(reservationItem?.minimumSpend)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Image
                src={
                  reservationItem?.image
                    ? `data:image/jpeg;base64,${reservationItem?.image}`
                    : noImage
                }
                width={60}
                height={60}
                style={{ objectFit: 'cover' }}
                className={'bg-contain h-[100px] rounded-lg w-[159px]'}
                aria-label='reservation image'
                alt='reservation image'
              />
            </div>
          </div>
        </section>
      )}
    </Container>
  );
};

export default ReservationDetails;
