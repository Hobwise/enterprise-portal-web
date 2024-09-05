import { Button, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import noBooking from '../../../../../public/assets/images/no-booking.png';
import CreateTeam from './createTeam';

const EmptyPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <div>
      <h1 className='text-[16px] leading-8 font-semibold'>Team members</h1>
      <p className='text-sm  text-grey600 md:mb-10 mb-4'>
        Invite your colleagues to work faster and collaborate together
      </p>
      <article className='rounded-lg grid place-content-center p-3 py-10 bg-[#FAFAFA]'>
        <div className='space-y-5  flex justify-center text-center items-center flex-col max-w-[300px]'>
          <Image
            src={noBooking}
            width={100}
            height={100}
            className='object-cover rounded-lg'
            aria-label='booking icon'
            alt='booking icon'
          />

          <div>
            <h3 className='text-[18px] leading-8 font-semibold'>
              You have no team members yet
            </h3>
            <p className='text-sm font-[400] text-grey600 '>
              Add team members to your business to attend to customers and
              fulfill orders.
            </p>
          </div>

          <Button
            onPress={onOpen}
            className='text-white bg-primaryColor rounded-lg'
          >
            Invite new member
          </Button>
        </div>
      </article>
      <CreateTeam isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
};

export default EmptyPage;
