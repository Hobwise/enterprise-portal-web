'use client';
import Container from '../../../components/dashboardContainer';

import React, { useEffect, useState } from 'react';

import CreateMenu from '@/components/ui/dashboard/menu/createMenu';
import MenuList from '@/components/ui/dashboard/menu/menu';

import {
  createMenu,
  getMenuByBusiness,
} from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { downloadCSV } from '@/lib/downloadToExcel';
import {
  CustomLoading,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import {
  Button,
  ButtonGroup,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  useDisclosure,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoAddCircleOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';

type MenuItem = {
  name: string;
  items: Array<{
    menuID: string;
    menuName: string;
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

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getAllMenus = async () => {
    const data = await getMenuByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      response.sort((a: MenuItem, b: MenuItem) => a.name.localeCompare(b.name));

      setMenus(response);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
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
    if (menus.length > 0) {
      return <MenuList menus={menus} onOpen={onOpen} />;
    } else {
      return <CreateMenu onOpen={onOpen} />;
    }
  };

  const newArray = menus?.map((item) => {
    const menuName = item?.items[0]?.menuName;
    const itemName = item?.items[0]?.itemName;
    const price = item?.items[0]?.price;
    const itemDescription = item?.items[0]?.itemDescription;
    const currency = item?.items[0]?.currency;
    const isAvailabale = item?.items[0]?.isAvailabale;
    const hasVariety = item?.items[0]?.hasVariety;
    return {
      menuName,
      itemName,
      price,
      itemDescription,
      currency,
      isAvailabale,
      hasVariety,
    };
  });
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
                  {menus[0].items?.length}
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
          {menus.length > 0 && (
            <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
              <Button
                onClick={() => router.push('/dashboard/menu/preview-menu')}
                className='flex text-grey600 bg-white'
              >
                <IoPhonePortraitOutline />
                <p>Preview menu</p>
              </Button>

              <Button
                onClick={() => downloadCSV(newArray)}
                className='flex text-grey600 bg-white'
              >
                <MdOutlineFileDownload className='text-[22px]' />
                <p>Export csv</p>
              </Button>
            </ButtonGroup>
          )}

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
      {isLoading ? <CustomLoading /> : <>{getScreens()}</>}

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
