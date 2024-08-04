'use client';

import React, { useEffect, useMemo, useState } from 'react';

import CreateMenu from '@/components/ui/dashboard/menu/createMenu';
import MenuList from '@/components/ui/dashboard/menu/menu';

import { createMenu } from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
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
import {
  IoAddCircleOutline,
  IoPhonePortraitOutline,
  IoSearchOutline,
} from 'react-icons/io5';

import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useGlobalContext } from '@/hooks/globalProvider';
import { MdOutlineFileDownload } from 'react-icons/md';

const Menu: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { userRolePermissions, role } = usePermission();

  const businessInformation = getJsonItemFromLocalStorage('business');

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMenu();
  const { setPage, setMenuIdTable } = useGlobalContext();

  useEffect(() => {
    // setMenuIdTable(data[0].id);
    setPage(1);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

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

  const filteredItems = useMemo(() => {
    return data
      ?.map((item) => ({
        ...item,
        items: item?.items?.filter(
          (item) =>
            item?.itemName?.toLowerCase().includes(searchQuery) ||
            String(item?.price)?.toLowerCase().includes(searchQuery) ||
            item?.menuName?.toLowerCase().includes(searchQuery) ||
            item?.itemDescription?.toLowerCase().includes(searchQuery)
        ),
      }))
      .filter((menu) => menu?.items?.length > 0);
  }, [data, searchQuery]);

  const getScreens = () => {
    if (data?.length > 0) {
      return (
        <MenuList
          menus={filteredItems}
          onOpen={onOpen}
          refetch={refetch}
          searchQuery={searchQuery}
        />
      );
    } else if (isError) {
      return <Error onClick={() => refetch()} />;
    } else {
      return <CreateMenu onOpen={onOpen} />;
    }
  };

  const newArray = data?.map((item) => {
    const menuName = item?.items[0]?.menuName;
    const itemName = item?.items[0]?.itemName;
    const price = item?.items[0]?.price;
    const itemDescription = item?.items[0]?.itemDescription;
    const currency = item?.items[0]?.currency;
    const isAvailable = item?.items[0]?.isAvailable;
    const hasVariety = item?.items[0]?.hasVariety;
    return {
      menuName,
      itemName,
      price,
      itemDescription,
      currency,
      isAvailable,
      hasVariety,
    };
  });

  return (
    <>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {data?.length > 0 ? (
              <div className='flex items-center'>
                <span>All menu</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data[0]?.totalCount}
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
            </>
          )}

          {role === 0 && userRolePermissions?.canCreateMenu === true && (
            <CustomButton
              onClick={
                data?.length > 0
                  ? () => router.push('/dashboard/menu/add-menu-item')
                  : onOpen
              }
              className='py-2 px-4 md:mb-0 mb-4 text-white'
              backgroundColor='bg-primaryColor'
            >
              <div className='flex gap-2 items-center justify-center'>
                <IoAddCircleOutline className='text-[22px]' />
                <p>{data?.length > 0 ? 'Add menu items' : 'Add menu'} </p>
              </div>
            </CustomButton>
          )}
        </div>
      </div>
      {isLoading ? <CustomLoading /> : <>{getScreens()} </>}

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
    </>
  );
};

export default Menu;
