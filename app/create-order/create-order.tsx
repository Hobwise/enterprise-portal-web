'use client';
import { Chip, Divider, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import { togglePreview } from '@/components/ui/dashboard/menu/preview-menu/data';
import CheckoutModal from '@/components/ui/dashboard/orders/place-order/checkoutModal';
import { CheckIcon } from '@/components/ui/dashboard/orders/place-order/data';
import ViewModal from '@/components/ui/dashboard/orders/place-order/view';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
import useMenuConfig from '@/hooks/cachedEndpoints/useMenuConfiguration';
import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { formatPrice } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { HiArrowLongLeft } from 'react-icons/hi2';
import noMenu from '../../public/assets/images/no-menu.png';
import SplashScreen from '../reservation/splash-screen';
import Filters from './filter';

const INITIAL_VISIBLE_COLUMNS = ['name', 'desc', 'price', 'actions'];
const columns = [
  { name: 'ID', uid: 'menuID' },
  { name: '', uid: 'name' },
  { name: '', uid: 'price' },
  { name: '', uid: 'desc' },
  { name: '', uid: 'actions' },
];
const CreateOrder = () => {
  const searchParams = useSearchParams();

  let businessId = searchParams.get('businessID');
  let cooperateID = searchParams.get('cooperateID');

  const { data: menuConfig } = useMenuConfig(businessId, cooperateID);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { menuIdTable, setMenuIdTable, setPage } = useGlobalContext();

  const [selectedMenu, setSelectedMenu] = useState([]);
  const [isOpenVariety, setIsOpenVariety] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const { data, isLoading, isError, refetch } = useMenu(
    businessId,
    cooperateID
  );
  useEffect(() => {
    setMenuIdTable(data?.[0]?.id);
  }, []);
  const [filteredMenu, setFilteredMenu] = useState(data?.[0]?.items);
  const handleTabClick = (index) => {
    setPage(1);
    const filteredMenu = data?.filter((item) => item.name === index);

    setMenuIdTable(filteredMenu[0]?.id);
    setFilteredMenu(filteredMenu[0]?.items);
  };

  const topContent = useMemo(() => {
    return <Filters menus={data} handleTabClick={handleTabClick} />;
  }, [data?.length]);

  const matchingObject = data?.find((category) => category?.id === menuIdTable);

  const matchingObjectArray = matchingObject
    ? matchingObject?.items
    : data?.[0]?.items;

  const { bottomContent } = usePagination(
    matchingObject,
    columns,
    INITIAL_VISIBLE_COLUMNS
  );

  if (isError) {
    return (
      <div className='h-screen grid place-content-center bg-white'>
        {' '}
        <Error imageHeight={'h-32'} onClick={() => refetch()} />
      </div>
    );
  }
  if (isLoading) {
    return <SplashScreen />;
  }
  const convertActiveTile = (activeTile: number) => {
    const previewStyles: { [key: string]: string } = {
      0: 'List left',
      1: 'List Right',
      2: 'Single column 1',
      3: 'Single column 2',
      4: 'Double column',
    };

    return previewStyles[activeTile];
  };

  type SelectedItem = {
    id: string;
    count: number;
    itemID: string;
    itemName: string;
    price: number;
    image: string;
    isVariety: boolean;
  };
  type MenuItem = {
    name: string;
    items: Array<{
      id: string;
      itemID: string;
      itemName: string;
      menuName: string;
      itemDescription: string;
      price: number;
      currency: string;
      isAvailable: boolean;
      hasVariety: boolean;
      image: string;
      isVariety: boolean;
      varieties: null | any;
    }>;
  };

  const toggleVarietyModal = (menu: any) => {
    setSelectedMenu(menu);
    setIsOpenVariety(!isOpenVariety);
  };

  const handleCardClick = (menuItem: MenuItem) => {
    const existingItem = selectedItems.find((item) => item.id === menuItem.id);

    if (existingItem) {
      setSelectedItems(selectedItems.filter((item) => item.id !== menuItem.id));
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: menuItem.id,
          count: 1,
          isVariety: menuItem.isVariety,
          itemName: menuItem.itemName,
          menuName: menuItem.menuName,
          price: menuItem.price,
          image: menuItem.image,
        },
      ]);
    }
  };
  const handleIncrement = (id: string) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      )
    );
  };
  const handleDecrement = (id: string) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.count > 1) {
          return { ...item, count: item.count - 1 };
        }

        return item;
      })
    );
  };
  const calculateTotalPrice = () => {
    return selectedItems.reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );
  };

  const baseString = 'data:image/jpeg;base64,';
  return (
    <main className='grid place-content-center '>
      <article
        style={{
          backgroundColor: menuConfig?.backgroundColour || 'white',
        }}
        className='xl:block relative  h-screen   overflow-scroll  xl:w-[320px] w-full xl:rounded-[40px] rounded-none  shadow-lg'
      >
        {menuConfig?.image.length > baseString.length && (
          <Image
            fill
            className='absolute backdrop-brightness-125 bg-cover opacity-25'
            src={baseString + menuConfig?.image}
            alt='background'
          />
        )}

        <div className='p-4 pt-6 flex justify-between'>
          <div>
            <h1 className='text-[28px] font-[700] text-black relative '>
              Menu
            </h1>
            <p className='text-sm  text-grey600  w-full '>
              {selectedItems.length > 0
                ? `${selectedItems.length} items selected`
                : 'Select items from the menu'}
            </p>
          </div>
          <CustomButton
            onClick={selectedItems.length > 0 ? onOpen : {}}
            className='py-2 px-4 mb-0 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <p>{'Proceed'} </p>
              <HiArrowLongLeft className='text-[22px] rotate-180' />
            </div>
          </CustomButton>
        </div>
        {topContent}

        <div
          className={`${
            togglePreview(convertActiveTile(menuConfig?.layout))?.main
          } relative  px-4`}
        >
          {matchingObjectArray?.map((item) => {
            const isSelected =
              selectedItems.find((selected) => selected.id === item.id) ||
              selectedItems.some((menu) =>
                item.varieties?.some((variety) => variety.id === menu.id)
              );

            return (
              <>
                <div
                  onClick={() => toggleVarietyModal(item)}
                  key={item.menuID}
                  className={`${
                    togglePreview(convertActiveTile(menuConfig?.layout))
                      ?.container
                  } ${
                    convertActiveTile(menuConfig?.layout) === 'List Right' &&
                    menuConfig?.useBackground &&
                    'flex-row-reverse'
                  } flex  my-4`}
                >
                  {menuConfig?.useBackground && (
                    <div
                      className={
                        togglePreview(convertActiveTile(menuConfig?.layout))
                          ?.imageContainer
                      }
                    >
                      <Image
                        className={`bg-cover rounded-lg ${
                          togglePreview(convertActiveTile(menuConfig?.layout))
                            ?.imageClass
                        }`}
                        width={60}
                        height={60}
                        src={item.image ? `${baseString}${item.image}` : noMenu}
                        alt='menu'
                      />
                    </div>
                  )}
                  <div
                    style={{
                      color: menuConfig?.textColour,
                    }}
                    className={`text-[14px]  ${
                      togglePreview(convertActiveTile(menuConfig?.layout))
                        ?.textContainer
                    } flex flex-col justify-center`}
                  >
                    <p className='font-[700]'>{item.menuName}</p>
                    <p className='text-[13px]'>{formatPrice(item.price)}</p>
                    <p className='text-[13px]'>{item.itemDescription}</p>
                    {isSelected && (
                      <Chip
                        startContent={<CheckIcon size={18} />}
                        variant='flat'
                        classNames={{
                          base: 'bg-primaryColor text-white text-[10px] mt-1',
                        }}
                      >
                        Selected
                      </Chip>
                    )}
                  </div>
                </div>
                {togglePreview(convertActiveTile(menuConfig?.layout))
                  ?.divider && <Divider className='text-[#E4E7EC] h-[1px]' />}
              </>
            );
          })}
        </div>
        <>{bottomContent}</>
      </article>

      <CheckoutModal
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        selectedItems={selectedItems}
        totalPrice={calculateTotalPrice()}
        onOpenChange={onOpenChange}
        isOpen={isOpen}
        closeModal={true}
        setSelectedItems={setSelectedItems}
      />

      <ViewModal
        handleCardClick={handleCardClick}
        selectedMenu={selectedMenu}
        isOpenVariety={isOpenVariety}
        toggleVarietyModal={toggleVarietyModal}
        selectedItems={selectedItems}
      />
    </main>
  );
};

export default CreateOrder;
