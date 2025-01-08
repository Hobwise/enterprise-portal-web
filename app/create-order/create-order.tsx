'use client';
import { Chip, Divider, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import { togglePreview } from '@/components/ui/dashboard/menu/preview-menu/data';

import { CheckIcon } from '@/components/ui/dashboard/orders/place-order/data';

import useMenuConfig from '@/hooks/cachedEndpoints/useMenuConfiguration';
import { useGlobalContext } from '@/hooks/globalProvider';
import { cn, formatPrice } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { HiArrowLongLeft } from 'react-icons/hi2';
import noMenu from '../../public/assets/images/no-menu.png';

import useMenuUser from '@/hooks/cachedEndpoints/userMenuUser';
import SplashScreen from '../reservation/splash-screen';
import CheckoutModal from './checkoutModal';
import Filters from './filter';
import ViewModal from './viewMore';

const CreateOrder = () => {
  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessID');
  let cooperateID = searchParams.get('cooperateID');
  let qrId = searchParams.get('id');

  const { data: menuConfig } = useMenuConfig(businessId, cooperateID);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { menuIdTable, setMenuIdTable, setPage } = useGlobalContext();

  const [selectedMenu, setSelectedMenu] = useState([]);
  const [isOpenVariety, setIsOpenVariety] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const { data, isLoading, isError, refetch } = useMenuUser(
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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    if (selectedItems.length > 0) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedItems]);

  if (isError) {
    return (
      <div className="h-screen grid place-content-center bg-white">
        {' '}
        <Error imageHeight={'h-32'} onClick={() => refetch()} />
      </div>
    );
  }
  if (isLoading) {
    return <SplashScreen businessName={businessName} />;
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
    count: number;
    packingCost: number;
    isPacking?: boolean;
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

  const handleCardClick = (menuItem: SelectedItem, isItemPacked: boolean) => {
    const existingItem = selectedItems.find((item) => item.id === menuItem.id);

    if (existingItem) {
      setSelectedItems(selectedItems.filter((item) => item.id !== menuItem.id));
    } else {
      setSelectedItems((prevItems: any) => [
        ...prevItems,
        { ...menuItem, count: 1, isPacking: isItemPacked },
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

  const handlePackingCost = (itemId: string, isPacking: boolean) => {
    let selectedItemsCopy = [...selectedItems];
    const existingItem = selectedItemsCopy.find((item) => item.id === itemId);
    if (!existingItem) {
      return;
    }

    const existingItemIndex = selectedItemsCopy.findIndex(
      (item) => item.id === itemId
    );
    const updatedItem = { ...existingItem, isPacking };
    selectedItemsCopy[existingItemIndex] = updatedItem;

    setSelectedItems(selectedItemsCopy);
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((acc, item) => {
      const additionalCost = item.isPacking ? item.packingCost : 0;
      return acc + item.price * item.count + additionalCost;
    }, 0);
  };

  const baseString = 'data:image/jpeg;base64,';

  return (
    <main className=" ">
      <article
        style={{
          backgroundColor: menuConfig?.backgroundColour || 'white',
        }}
        className="xl:block relative  h-screen   overflow-scroll    shadow-lg"
      >
        {menuConfig?.image.length > baseString.length && (
          <Image
            fill
            className="absolute backdrop-brightness-125 bg-cover opacity-25"
            src={baseString + menuConfig?.image}
            alt="background"
          />
        )}

        <div className="p-4 pt-6 flex justify-between">
          <div>
            <h1 className="text-[28px] font-[700] text-black relative ">
              Menu
            </h1>
            <p className="text-sm  text-grey600  w-full ">
              {selectedItems.length > 0
                ? `${selectedItems.length} items selected`
                : 'Select items from the menu'}
            </p>
          </div>
          <CustomButton
            onClick={selectedItems.length > 0 ? onOpen : {}}
            className="py-2 px-4 mb-0 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-2 items-center justify-center">
              {selectedItems.length > 0 && (
                <span className="font-bold">
                  {' '}
                  {formatPrice(calculateTotalPrice())}{' '}
                </span>
              )}
              <p>{'Proceed'} </p>
              <HiArrowLongLeft className="text-[22px] rotate-180" />
            </div>
          </CustomButton>
        </div>
        {topContent}

        <div
          className={cn(
            'relative px-4',
            menuConfig?.layout &&
              togglePreview(convertActiveTile(menuConfig?.layout))?.main
          )}
        >
          {matchingObjectArray?.map((item) => {
            const isSelected =
              selectedItems.find((selected) => selected.id === item.id) ||
              selectedItems.some((menu) =>
                item.varieties?.some((variety) => variety.id === menu.id)
              );

            return (
              <React.Fragment key={item.menuID}>
                <div
                  onClick={() => toggleVarietyModal(item)}
                  className={cn(
                    'flex my-4',
                    menuConfig?.layout &&
                      togglePreview(convertActiveTile(menuConfig.layout))
                        ?.container,
                    menuConfig?.useBackground &&
                      convertActiveTile(menuConfig?.layout) === 'List Right' &&
                      'flex-row-reverse'
                  )}
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
                        alt="menu"
                      />
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex flex-col justify-center w-[70%] text-sm',
                      menuConfig?.layout
                        ? togglePreview(convertActiveTile(menuConfig?.layout))
                            ?.textContainer
                        : 'text-black'
                    )}
                  >
                    <p className="font-[700]">{item.itemName}</p>
                    <p className="text-[13px]">{item.menuName}</p>
                    <p className="text-[13px]">{formatPrice(item.price)}</p>
                    {isSelected && (
                      <Chip
                        startContent={<CheckIcon size={18} />}
                        variant="flat"
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
                  ?.divider && <Divider className="text-[#E4E7EC] h-[1px]" />}
              </React.Fragment>
            );
          })}
        </div>
      </article>

      {isOpen && (
        <CheckoutModal
          qrId={qrId}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          selectedItems={selectedItems}
          handlePackingCost={handlePackingCost}
          totalPrice={calculateTotalPrice()}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          closeModal={true}
          businessId={businessId}
          cooperateID={cooperateID}
          setSelectedItems={setSelectedItems}
        />
      )}

      <ViewModal
        handleCardClick={handleCardClick}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        handlePackingCost={handlePackingCost}
        selectedMenu={selectedMenu}
        isOpenVariety={isOpenVariety}
        totalPrice={calculateTotalPrice()}
        toggleVarietyModal={toggleVarietyModal}
        selectedItems={selectedItems}
      />
    </main>
  );
};

export default CreateOrder;
