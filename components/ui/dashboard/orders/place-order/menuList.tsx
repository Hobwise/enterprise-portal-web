'use client';
import React, { useEffect, useState } from 'react';
import Filters from './filter';
import { getMenuByBusiness } from '@/app/api/controllers/dashboard/menu';
import {
  CustomLoading,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import Image from 'next/image';
import noImage from '../../../../../public/assets/images/no-image.jpg';
import noMenu from '../../../../../public/assets/images/no-menu.png';
import {
  Button,
  Card,
  Chip,
  Pagination,
  Skeleton,
  Spacer,
} from '@nextui-org/react';
import { CheckIcon, SkeletonLoading } from './data';
import { FaPlus } from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa6';

type MenuItem = {
  name: string;
  items: Array<{
    id: string;
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

type SelectedItem = {
  id: string;
  count: number;
  itemName: string;
  price: number;
  image: string;
};

const MenuList = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [menus, setMenus] = useState<MenuData>([]);
  const [filteredMenu, setFilteredMenu] = React.useState([]);
  const [value, setValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [page, setPage] = React.useState(1);
  const rowsPerPage = 12;

  const pages = Math.ceil(filteredMenu.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredMenu.slice(start, end);
  }, [page, filteredMenu]);

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
          itemName: menuItem.itemName,
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
    const filteredMenu = menus.filter((item) => item.name === index);
    setFilteredMenu(filteredMenu[0]?.items);
  };
  const getAllMenus = async () => {
    setIsLoading(true);

    const data = await getMenuByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      response.sort((a: MenuItem, b: MenuItem) => a.name.localeCompare(b.name));
      setFilteredMenu(response[0]?.items);
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

  return (
    <section>
      <Filters
        menus={menus}
        handleTabChange={handleTabChange}
        handleTabClick={handleTabClick}
      />
      <article className='flex mt-6 gap-3'>
        <div className='xl:max-w-[65%] w-full'>
          {isLoading ? (
            <SkeletonLoading />
          ) : (
            <div className='grid w-full grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4'>
              {items?.map((menu, index) => (
                <div
                  title='select menu'
                  onClick={() => handleCardClick(menu)}
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

                  <Image
                    width={163.5}
                    height={100.54}
                    src={
                      menu?.image
                        ? `data:image/jpeg;base64,${menu?.image}`
                        : noImage
                    }
                    alt={index + menu.id}
                    className='w-full md:h-[100.54px] h-[150px] rounded-lg border border-primaryGrey mb-2 bg-contain'
                  />
                  <div className=''>
                    <h3 className='text-[14px] font-[500]'>{menu.itemName}</h3>
                    <p className='text-gray-600 text-[13px] font-[400]'>
                      ₦{menu.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Spacer y={8} />

          <div className='flex gap-2 justify-between items-center'>
            <Button
              size='sm'
              variant='faded'
              className='text-black'
              color='secondary'
              onPress={() => setPage((prev) => (prev > 1 ? prev - 1 : prev))}
            >
              Previous
            </Button>
            <Pagination
              isCompact
              page={page}
              total={pages}
              onChange={setPage}
            />
            <Button
              size='sm'
              variant='faded'
              className='text-black'
              color='secondary'
              onPress={() => setPage((prev) => (prev < 10 ? prev + 1 : prev))}
            >
              Next
            </Button>
          </div>
        </div>

        <div className='hidden xl:block bg-[#F7F6FA] p-4 rounded-lg flex-grow'>
          {selectedItems.length > 0 ? (
            <>
              <h2 className='font-[600] mx-2 mb-2'>
                {selectedItems.length} Items selected
              </h2>
              <div className='rounded-lg border border-[#E4E7EC80] p-2 '>
                {selectedItems?.map((item) => {
                  return (
                    <div className='flex justify-between'>
                      <div className='pb-2 rounded-lg text-black  flex'>
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
                        <div className='p-3 flex flex-col text-sm justify-center'>
                          <p className='text-grey600 '>{item.itemName}</p>
                          <Spacer y={2} />
                          <p className='font-[600]'>₦{item?.price}</p>
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
                  );
                })}
              </div>
              <Spacer y={2} />
              <div>
                <h3 className='text-[13px] font-[500]'>Total</h3>
                <p className='text-[] font-[700]'>₦{calculateTotalPrice()}</p>
              </div>
            </>
          ) : (
            <div className='flex flex-col h-full rounded-xl font-[500] justify-center items-center'>
              <Image
                className='w-[50px] h-[50px]'
                src={noMenu}
                alt='no menu illustration'
              />
              <Spacer y={3} />
              <p>Selected menu(s) will appear here</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
};

export default MenuList;
