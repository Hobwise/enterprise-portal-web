'use client';
import Container from '../../../components/dashboardContainer';

import React, { useEffect, useState } from 'react';

import CreateMenu from '@/components/ui/dashboard/menu/createMenu';
import MenuList from '@/components/ui/dashboard/menu/menu';

import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  createMenu,
  getMenuByBusiness,
} from '@/app/api/controllers/dashboard/menu';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';
import { CustomButton } from '@/components/customButton';
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Spacer,
  Chip,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import hobink from '../../../public/assets/images/hobink.png';

type MenuItem = {
  name: string;
  items: Array<{
    menuID: string;
    itemName: string;
    itemDescription: string;
    price: number;
    currency: string;
    isAvailabale: boolean;
    hasVariety: boolean;
    image: string;
    varieties: null | any;
  }>;
};

type MenuData = Array<MenuItem>;
const Menu: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [menus, setMenus] = useState<MenuData>([]);

  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getAllMenus = async () => {
    setIsLoading(true);

    const data = await getMenuByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);
    let response = data?.data?.data;
    response.sort((a, b) => a.name.localeCompare(b.name));

    setMenus(response);

    if (data?.data?.isSuccessful) {
    } else if (data?.data?.error) {
    }
  };

  useEffect(() => {
    getAllMenus();
  }, []);

  const handleCreateMenu = async () => {
    setLoading(true);

    const data = await createMenu(businessInformation[0]?.businessId, { name });
    setLoading(false);

    if (data?.data?.isSuccessful) {
      notify({
        title: 'Success!',
        text: 'Menu successfully created',
        type: 'success',
      });
      router.push('/dashboard/menu/add-menu-item');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const getScreens = () => {
    if (menus.length === 0 && !isLoading) {
      return <CreateMenu onOpen={onOpen} />;
    }
    if (menus.length > 0 && !isLoading) {
      return <MenuList menus={menus} onOpen={onOpen} />;
    }

    return (
      <div
        className={`loadingContainer bg-white flex flex-col justify-center items-center`}
      >
        <div className='animate-bounce'>
          <Image
            src={hobink}
            style={{ objectFit: 'cover' }}
            alt='hobink logo'
          />
        </div>
        <p className='text-center text-primaryColor'>Loading...</p>
      </div>
    );
  };

  // useEffect(() => {
  //   getAllMenus();
  // }, []);
  return (
    <Container>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {menus.length > 0 ? (
              <div className='flex items-center'>
                <span>All menu</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {menus.length}
                </Chip>
              </div>
            ) : (
              <span>Menu</span>
            )}
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Show all menu items
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <CustomButton
            // onClick={openAddRoleModal}
            className='py-2 px-4 md:mb-0 text-black border border-[#D0D5DD] mb-4 '
            backgroundColor='bg-white'
          >
            <div className='flex gap-2 items-center justify-center'>
              <MdOutlineFileDownload className='text-[22px]' />
              <p>Export csv</p>
            </div>
          </CustomButton>

          <CustomButton
            onClick={
              menus.length > 0
                ? () => router.push('/dashboard/menu/add-menu-item')
                : onOpen
            }
            className='py-2 px-4 md:mb-0 mb-4 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <IoAddCircleOutline className='text-[22px]' />
              <p>{menus.length > 0 ? 'Add menu items' : 'Add menu'} </p>
            </div>
          </CustomButton>
        </div>
      </div>
      {getScreens()}
      {/* <Modal isOpen={openModal} onOpenChange={toggleModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>Hello world</ModalBody>
            </>
          )}
        </ModalContent>
      </Modal> */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <h2 className='text-[24px] leading-3 mt-8 text-black font-semibold'>
                  Create Menu
                </h2>
                <p className='text-sm  text-grey600  xl:w-[231px]  w-full mb-4'>
                  Create a menu to add item
                </p>
                <CustomInput
                  type='text'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  value={name}
                  label='Name of menu'
                  placeholder='E.g Drinks'
                />
                <Spacer y={2} />

                <CustomButton
                  loading={loading}
                  onClick={handleCreateMenu}
                  disabled={!name || loading}
                  type='submit'
                >
                  {loading ? 'Loading' : 'Proceed'}
                </CustomButton>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Menu;
