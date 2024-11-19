'use client';
import { getOrder } from '@/app/api/controllers/dashboard/orders';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import {
  clearItemLocalStorage,
  formatPrice,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import {
  Button,
  Chip,
  Divider,
  Spacer,
  useDisclosure,
} from '@nextui-org/react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { HiArrowLongLeft } from 'react-icons/hi2';
import { IoSearchOutline } from 'react-icons/io5';
import noImage from '../../../../../public/assets/images/no-image.svg';
import noMenu from '../../../../../public/assets/images/no-menu.png';
import CheckoutModal from './checkoutModal';
import {
  CheckIcon,
  MenuSkeletonLoading,
  SelectedSkeletonLoading,
} from './data';
import Filters from './filter';
import ViewModal from './view';

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

type MenuData = Array<MenuItem>;

type SelectedItem = {
  id: string;
  count: number;
  itemID: string;
  itemName: string;
  price: number;
  image: string;
  isVariety: boolean;
};

const MenuList = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { page, setPage, rowsPerPage, menuIdTable, setMenuIdTable } =
    useGlobalContext();

  const [order] = useState<any>(getJsonItemFromLocalStorage('order'));
  const { data, isLoading, isError, refetch } = useMenu();
  const [filterValue, setFilterValue] = React.useState('');

  const filteredItems = useMemo(() => {
    return data?.map((item) => ({
      ...item,
      items: item?.items?.filter(
        (item) =>
          item?.itemName?.toLowerCase().includes(filterValue) ||
          String(item?.price)?.toLowerCase().includes(filterValue) ||
          item?.menuName?.toLowerCase().includes(filterValue) ||
          item?.itemDescription?.toLowerCase().includes(filterValue)
      ),
    }));
  }, [data, filterValue]);

  useEffect(() => {
    setMenuIdTable(filteredItems?.[0]?.id);
  }, []);

  const [loading, setLoading] = useState<Boolean>(false);

  const [value, setValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isOpenVariety, setIsOpenVariety] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [filteredMenu, setFilteredMenu] = React.useState(data?.[0]?.items);

  const getOrderDetails = async () => {
    setLoading(true);
    const response = await getOrder(order.id);

    setLoading(false);
    if (response?.data?.isSuccessful) {
      const secondArrayIds = data.flatMap((section) =>
        section.items.map((item) => item.id)
      );

      // const idsInCommon = response?.data?.data?.orderDetails.filter((item) =>
      //   secondArrayIds.includes(item.itemID)
      // );

      // const updatedArray = idsInCommon.map((item) => {
      //   const { unitPrice, quantity, itemID, ...rest } = item;
      //   return {
      //     ...rest,
      //     id: itemID,
      //     price: unitPrice,
      //     count: quantity,
      //   };
      // });
      const updatedArray = response?.data?.data.orderDetails.map((item) => {
        const { unitPrice, quantity, itemID, ...rest } = item;
        return {
          ...rest,
          id: itemID,
          price: unitPrice,
          count: quantity,
        };
      });

      setOrderDetails(response?.data?.data);
      setSelectedItems(updatedArray);

      clearItemLocalStorage('order');
    } else if (response?.data?.error) {
    }
  };

  const toggleVarietyModal = (menu: any) => {
    setSelectedMenu(menu);
    setIsOpenVariety(!isOpenVariety);
  };

  const matchingObject = filteredItems?.find(
    (category) => category?.id === menuIdTable
  );

  const matchingObjectArray = matchingObject
    ? matchingObject?.items
    : filteredMenu;
  const {
    bottomContent,

    // filterValue,
  } = usePagination(matchingObject);

  useEffect(() => {
    if (filteredItems && filterValue) {
      const filteredData = filteredItems.map((item) => ({
        ...item,
        items: item?.items?.filter(
          (item) =>
            item?.itemName?.toLowerCase().includes(filterValue) ||
            String(item?.price)?.toLowerCase().includes(filterValue) ||
            item?.menuName?.toLowerCase().includes(filterValue) ||
            item?.itemDescription?.toLowerCase().includes(filterValue)
        ),
      }));

      setFilteredMenu(filteredData.length > 0 ? filteredData[0].items : []);
    } else {
      setFilteredMenu(filteredItems?.[0]?.items);
    }
  }, [filterValue, filteredItems]);

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

  const handleIncrement = (id: string) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      )
    );
  };
  const calculateTotalPrice = () => {
    return selectedItems.reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );
  };
  const handleTabChange = (index) => {
    setValue(index);
  };

  const handleTabClick = (index) => {
    setPage(1);
    const filteredMenu = filteredItems.filter((item) => item.name === index);
    setMenuIdTable(filteredMenu[0]?.id);
    setFilteredMenu(filteredMenu[0]?.items);
  };

  useEffect(() => {
    if (data) {
      setFilteredMenu(data[0]?.items);
    }
    if (order?.id && data?.length > 0) {
      getOrderDetails();
    }
  }, [order?.id, data]);

  return (
    <>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            <span>Place an order</span>
          </div>
          <p className='text-sm  text-grey600 xl:mb-8 w-full mb-4'>
            Select items from the menu to place order
          </p>
        </div>
        <div className='flex items-center justify-center gap-3'>
          <div>
            <CustomInput
              classnames={'w-[242px]'}
              label=''
              size='md'
              value={filterValue}
              onChange={(e: any) => {
                const value = e.target.value;
                if (value) {
                  setFilterValue(value);
                  setPage(1);
                } else {
                  setFilterValue('');
                }
              }}
              isRequired={false}
              startContent={<IoSearchOutline />}
              type='text'
              placeholder='Search here...'
            />
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
      </div>

      <section>
        <Filters
          menus={data}
          handleTabChange={handleTabChange}
          handleTabClick={handleTabClick}
        />
        <article className='flex mt-6 gap-3'>
          <div className='xl:max-w-[65%] w-full'>
            {isLoading ? (
              <MenuSkeletonLoading />
            ) : isError ? (
              <Error imageWidth='w-16' onClick={() => refetch()} />
            ) : (
              <div className='grid w-full grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4'>
                {matchingObjectArray?.map((menu, index) => (
                  <div
                    title='select menu'
                    onClick={() => toggleVarietyModal(menu)}
                    key={menu.id}
                    className={'relative cursor-pointer'}
                  >
                    {selectedItems.find(
                      (selected) => selected.id === menu.id
                    ) && (
                      <Chip
                        className='absolute top-2 left-2'
                        startContent={<CheckIcon size={18} />}
                        variant='flat'
                        classNames={{
                          base: 'bg-primaryColor text-white text-[12px]',
                        }}
                      >
                        Selected
                      </Chip>
                    )}
                    {selectedItems.some((item) =>
                      menu.varieties?.some((variety) => variety.id === item.id)
                    ) && (
                      <Chip
                        className='absolute top-2 left-2'
                        startContent={<CheckIcon size={18} />}
                        variant='flat'
                        classNames={{
                          base: 'bg-primaryColor text-white text-[12px]',
                        }}
                      >
                        Selected
                      </Chip>
                    )}

                    <Image
                      width={163.5}
                      height={100.54}
                      src={
                        menu?.image
                          ? `data:image/jpeg;base64,${menu?.image}`
                          : noImage
                      }
                      alt={index + menu?.id}
                      style={{
                        objectFit: 'cover',
                      }}
                      className='w-full md:h-[100.54px] h-[150px] rounded-lg border border-primaryGrey mb-2 bg-cover'
                    />
                    <div className=''>
                      <h3 className='text-[14px] font-[500]'>
                        {menu.itemName}
                      </h3>
                      <p className='text-gray-600 text-[13px] font-[400]'>
                        {formatPrice(menu.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Spacer y={8} />
            <div>{!isLoading && bottomContent}</div>
          </div>

          <div className='hidden xl:block max-h-[360px] overflow-scroll bg-[#F7F6FA] p-4 rounded-lg flex-grow'>
            {selectedItems.length > 0 ? (
              <>
                <h2 className='font-[600] mx-2 mb-2'>
                  {selectedItems.length} Items selected
                </h2>
                <div className='rounded-lg border border-[#E4E7EC80] p-2 '>
                  {selectedItems?.map((item, index) => {
                    return (
                      <>
                        <div
                          key={item.id}
                          className='flex py-3 justify-between'
                        >
                          <div className=' rounded-lg text-black  flex'>
                            <div>
                              <Image
                                src={
                                  item?.image
                                    ? `data:image/jpeg;base64,${item?.image}`
                                    : noImage
                                }
                                width={20}
                                height={20}
                                className='object-cover rounded-lg w-20 h-20'
                                aria-label='uploaded image'
                                alt='uploaded image(s)'
                              />
                            </div>
                            <div className='ml-3 flex flex-col text-sm justify-center'>
                              <p className='font-[600]'>{item.menuName}</p>
                              <Spacer y={1} />
                              <p className='text-grey600 '>{item.itemName}</p>

                              <p className='font-[600] text-primaryColor'>
                                {formatPrice(item?.price)}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center'>
                            <Button
                              onClick={() => handleDecrement(item.id)}
                              isIconOnly
                              radius='sm'
                              variant='faded'
                              className='border border-grey400'
                              aria-label='minus'
                            >
                              <FaMinus />
                            </Button>
                            <span className='font-bold py-2 px-4'>
                              {item.count}
                            </span>
                            <Button
                              onClick={() => handleIncrement(item.id)}
                              isIconOnly
                              radius='sm'
                              variant='faded'
                              className='border border-grey400'
                              aria-label='plus'
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </div>
                        {index !== selectedItems?.length - 1 && (
                          <Divider className='bg-[#E4E7EC80]' />
                        )}
                      </>
                    );
                  })}
                </div>
                <Spacer y={2} />
                <div>
                  <h3 className='text-[13px] font-[500]'>Total</h3>
                  <p className='text-[] font-[700]'>
                    {formatPrice(calculateTotalPrice())}
                  </p>
                </div>
              </>
            ) : (
              <>
                {loading ? (
                  <SelectedSkeletonLoading />
                ) : (
                  <div className='flex flex-col h-full rounded-xl justify-center items-center'>
                    <Image
                      className='w-[50px] h-[50px]'
                      src={noMenu}
                      alt='no menu illustration'
                    />
                    <Spacer y={3} />
                    <p className='text-sm text-grey400'>
                      Selected menu(s) will appear here
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </article>
        <CheckoutModal
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          selectedItems={selectedItems}
          totalPrice={calculateTotalPrice()}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          id={order?.id}
          orderDetails={orderDetails}
        />
        <ViewModal
          handleCardClick={handleCardClick}
          selectedMenu={selectedMenu}
          isOpenVariety={isOpenVariety}
          toggleVarietyModal={toggleVarietyModal}
          selectedItems={selectedItems}
        />
      </section>
    </>
  );
};

export default MenuList;
