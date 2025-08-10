'use client';
import { Chip, Divider, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import { togglePreview } from '@/components/ui/dashboard/menu/preview-menu/data';

import { CheckIcon } from '@/components/ui/dashboard/orders/place-order/data';

import useMenuConfig from '@/hooks/cachedEndpoints/useMenuConfiguration';
import { useGlobalContext } from '@/hooks/globalProvider';
import { formatPrice } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { HiArrowLongLeft } from 'react-icons/hi2';
import { IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { CustomInput } from '@/components/CustomInput';
import noMenu from '../../public/assets/images/no-menu.png';
import noImage from '../../public/assets/images/no-image.svg';

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
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useMenuUser(
    businessId,
    cooperateID
  );

  useEffect(() => {
    setMenuIdTable(data?.[0]?.id);
  }, []);
  const [filteredMenu, setFilteredMenu] = useState<any[]>([]);
  const handleTabClick = (index: any) => {
    setPage(1);
    const filteredMenu = data?.filter((item) => item.name === index);

    setMenuIdTable(filteredMenu?.[0]?.id);
    setFilteredMenu(filteredMenu?.[0]?.items);
  };

  useEffect(() => {
    if (data?.[0]?.items) {
      setFilteredMenu(data[0].items);
    }
  }, [data]);

  const topContent = useMemo(() => {
    return <Filters menus={data} handleTabClick={handleTabClick} />;
  }, [data?.length]);

  const matchingObject = data?.find((category) => category?.id === menuIdTable);

  const unfilteredArray = matchingObject
    ? matchingObject.items
    : filteredMenu || data?.[0]?.items || [];

  // Apply search filter
  const matchingObjectArray = useMemo(() => {
    if (!searchQuery) return unfilteredArray;
    
    return unfilteredArray?.filter((item) =>
      item?.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item?.price)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.menuName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [unfilteredArray, searchQuery]);

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
      <div className='h-screen grid place-content-center bg-white'>
        {' '}
        <Error imageHeight={'h-32'} onClick={() => refetch()} />
      </div>
    );
  }
  if (isLoading) {
    return <SplashScreen businessName={businessName} type='order' />;
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

  type Item = {
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
    isPacked?: boolean;
  };

  const toggleVarietyModal = (menu: any) => {
    setSelectedMenu(menu);

    setIsOpenVariety(!isOpenVariety);
  };

  const handleCardClick = (menuItem: Item, isItemPacked: boolean) => {
    const existingItem = selectedItems.find((item) => item.id === menuItem.id);
    if (existingItem) {
      setSelectedItems(selectedItems.filter((item) => item.id !== menuItem.id));
    } else {
      // setSelectedMenu(menuItem);
      setSelectedItems((prevItems: any) => [
        ...prevItems,
        {
          ...menuItem,
          count: 1,
          isPacked: isItemPacked,
          packingCost: menuItem.isVariety
            ? selectedMenu.packingCost
            : menuItem.packingCost || 0,
        },
      ]);
    }
  };

  const handleQuickAdd = (menuItem: Item, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the variety modal
    const existingItem = selectedItems.find((item) => item.id === menuItem.id);
    
    if (existingItem) {
      // If item exists, increment count
      handleIncrement(menuItem.id);
    } else {
      // Add new item with default options
      setSelectedItems((prevItems: any) => [
        ...prevItems,
        {
          ...menuItem,
          count: 1,
          isPacked: false, // Default to not packed
          packingCost: menuItem.packingCost || 0,
        },
      ]);
    }
  };

  const handleDecrement = (id: string) => {
    setSelectedItems((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.id === id) {
          if (item.count > 1) {
            return { ...item, count: item.count - 1 };
          } else {
            // Remove item when count reaches 0
            return null;
          }
        }
        return item;
      }).filter(Boolean) // Remove null items
    );
  };

  const handleIncrement = (id: string) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      )
    );
  };
  const calculateTotalPrice = () => {
    return selectedItems.reduce((acc, item) => {
      const itemTotal = item.price * item.count;
      // Allow packing even when packingCost is 0 or undefined
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      return acc + itemTotal + packingTotal;
    }, 0);
  };

  const handlePackingCost = (itemId: string, isPacked: boolean) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isPacked } : item
      )
    );
  };

  const baseString = 'data:image/jpeg;base64,';
  const handleCheckoutOpen = () => {
    if (selectedItems.length > 0) {
      if (!selectedMenu || Object.keys(selectedMenu).length === 0) {
        setSelectedMenu(selectedItems[0]);
      }
      onOpen();
    }
  };

  return (
    <main className='flex'>
      <article
        style={{
          backgroundColor: menuConfig?.backgroundColour || 'white',
        }}
        className='flex-1 xl:block relative h-screen overflow-scroll shadow-lg'
      >
        {menuConfig?.image.length > baseString.length && (
          <Image
            fill
            className='absolute backdrop-brightness-125 bg-cover opacity-25'
            src={baseString + menuConfig?.image}
            alt='background'
          />
        )}

        <div className='p-4 pt-6'>
          <div className='flex justify-between mb-4'>
            <div>
              <h1 className='text-[28px] font-[700] text-black relative '>
                Menu
              </h1>
              <p className='text-sm  text-grey600  w-full '>
                {selectedItems.length > 0
                  ? `${selectedItems.reduce((total, item) => total + item.count, 0)} Item${selectedItems.reduce((total, item) => total + item.count, 0) !== 1 ? 's' : ''} selected`
                  : 'Select items from the menu'}
              </p>
            </div>
            <CustomButton
              onClick={handleCheckoutOpen}
              className='py-2 px-4 mb-0 text-white'
              backgroundColor='bg-primaryColor'
            >
              <div className='flex gap-2 items-center justify-center'>
                {selectedItems.length > 0 && (
                  <span className='font-bold'>
                    {' '}
                    {formatPrice(calculateTotalPrice())}{' '}
                  </span>
                )}
                <p>{'Proceed'} </p>
                <HiArrowLongLeft className='text-[22px] rotate-180' />
              </div>
            </CustomButton>
          </div>
          <div className='mb-4'>
            <CustomInput
              classnames={'w-full md:w-[300px]'}
              label=''
              size='md'
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              isRequired={false}
              startContent={<IoSearchOutline />}
              type='text'
              placeholder='Search menu items...'
            />
          </div>
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
                  onClick={() => {
                    item?.isAvailable ? toggleVarietyModal(item) : null;
                  }}
                  key={item.menuID}
                  className={`${
                    togglePreview(convertActiveTile(menuConfig?.layout))
                      ?.container
                  } ${
                    convertActiveTile(menuConfig?.layout) === "List Right" &&
                    menuConfig?.useBackground &&
                    "flex-row-reverse"
                  } flex  my-4 text-black cursor-pointer relative`}
                >
                  {item?.isAvailable === false && (
                    <Chip
                      className={`capitalize absolute ${
                        togglePreview(convertActiveTile(menuConfig?.layout))
                          ?.chipPosition
                      }`}
                      color={"danger"}
                      size="sm"
                      variant="bordered"
                    >
                      {"Out of stock"}
                    </Chip>
                  )}
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
                    style={{
                      color: menuConfig?.textColour,
                    }}
                    className={`text-[14px]  ${
                      togglePreview(convertActiveTile(menuConfig?.layout))
                        ?.textContainer
                    } flex flex-col justify-center `}
                  >
                    <p className="font-[700]">{item.itemName}</p>
                    <p className="text-[13px]">{item.menuName}</p>
                    <p className="text-[13px]">{formatPrice(item.price)}</p>
                    {isSelected && (
                      <Chip
                        startContent={<CheckIcon size={18} />}
                        variant="flat"
                        classNames={{
                          base: "bg-primaryColor text-white text-[10px] mt-1",
                        }}
                      >
                        Selected
                      </Chip>
                    )}
                  </div>
                  {/* Quick Add Button */}
                  {item?.isAvailable && (
                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="absolute bottom-2 right-2 bg-primaryColor text-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                      aria-label="Quick add to cart"
                    >
                      <IoAddCircleOutline className="text-lg" />
                    </button>
                  )}
                </div>
                {togglePreview(convertActiveTile(menuConfig?.layout))
                  ?.divider && <Divider className="text-[#E4E7EC] h-[1px]" />}
              </>
            );
          })}
        </div>
      </article>

      {/* Selected Items Sidebar - Desktop only */}
      <aside className="hidden xl:block w-[380px] h-screen bg-[#F7F6FA] p-4 overflow-y-auto">
        {selectedItems.length > 0 ? (
          <>
            <h2 className="font-[600] text-lg mb-4">
              {selectedItems.reduce((total, item) => total + item.count, 0)} Item{selectedItems.reduce((total, item) => total + item.count, 0) !== 1 ? 's' : ''} selected
            </h2>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={item?.image ? `data:image/jpeg;base64,${item?.image}` : noImage}
                      width={50}
                      height={50}
                      className="object-cover rounded-lg"
                      alt={item.itemName}
                    />
                    <div>
                      <p className="font-[600] text-sm">{item.itemName}</p>
                      <p className="text-grey600 text-xs">{item.menuName}</p>
                      <p className="font-[600] text-primaryColor text-sm">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecrement(item.id)}
                      className="border border-grey400 rounded p-1 hover:bg-gray-100"
                      aria-label="minus"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="font-bold text-sm px-2">
                      {item.count}
                    </span>
                    <button
                      onClick={() => handleIncrement(item.id)}
                      className="border border-grey400 rounded p-1 hover:bg-gray-100"
                      aria-label="plus"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Divider className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="font-bold">Total:</p>
                <p className="font-bold text-lg">{formatPrice(calculateTotalPrice())}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full justify-center items-center">
            <Image
              className="w-[80px] h-[80px] mb-4"
              src={noMenu}
              alt="no menu illustration"
            />
            <p className="text-sm text-grey400 text-center">
              Selected items will appear here
            </p>
          </div>
        )}
      </aside>

      {isOpen && (
        <CheckoutModal
          qrId={qrId}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          selectedItems={selectedItems}
          totalPrice={calculateTotalPrice()}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          selectedMenu={selectedMenu}
          closeModal={true}
          businessId={businessId}
          cooperateID={cooperateID}
          handlePackingCost={handlePackingCost}
          setSelectedItems={setSelectedItems}
        />
      )}

      <ViewModal
        handleCheckoutOpen={handleCheckoutOpen}
        handleCardClick={handleCardClick}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        selectedMenu={selectedMenu}
        isOpenVariety={isOpenVariety}
        totalPrice={calculateTotalPrice()}
        handlePackingCost={handlePackingCost}
        toggleVarietyModal={toggleVarietyModal}
        selectedItems={selectedItems}
      />
    </main>
  );
};

export default CreateOrder;
