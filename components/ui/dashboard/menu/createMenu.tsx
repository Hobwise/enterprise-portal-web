'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import NoMenu from '../../../../public/assets/images/no-menu.png';
import { IoMdAdd } from 'react-icons/io';
import { Spacer } from '@nextui-org/react';
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from '@nextui-org/react';
import { CustomButton } from '@/components/customButton';
import { CustomInput } from '@/components/CustomInput';
import { useRouter } from 'next/navigation';
import Filters from './filters';
import { createMenu } from '@/app/api/controllers/dashboard/menu';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';

const CreateMenu = ({ onOpen }: any) => {
  return (
    <section>
      <Spacer y={14} />
      <div className='flex flex-col items-center'>
        <Image src={NoMenu} alt='no menu illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>Add items to your menu</p>
        <p className='text-sm font-[400] xl:w-[260px] w-full text-center text-[#475367]'>
          Start adding items to your menu so your customers can place orders
        </p>
        <Spacer y={5} />
        <CustomButton
          onClick={onOpen}
          className='py-2 px-4 md:mb-0 mb-4 text-white'
          backgroundColor='bg-primaryColor'
        >
          <div className='flex gap-2 items-center justify-center'>
            <IoMdAdd className='text-[22px]' />

            <p>Add a menu</p>
          </div>
        </CustomButton>
      </div>
    </section>
  );
};

export default CreateMenu;
