'use client';

import {
  editMenuItem,
  getMenuItem,
} from '@/app/api/controllers/dashboard/menu';
import { CustomButton } from '@/components/customButton';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useGlobalContext } from '@/hooks/globalProvider';
import {
  CustomLoading,
  formatPrice,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import { Button, ButtonGroup, Spacer, Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit, FaRegEdit } from 'react-icons/fa';
import { GoPlus } from 'react-icons/go';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { MdCreate } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { toast } from 'react-toastify';
import noImage from '../../../../public/assets/images/no-image.svg';
import DeleteMenu from './deleteMenu';
import DeleteVariety from './deleteVariety';
import EditMenu from './editMenu';
import EditVariety from './editVariety';
import VarietyModal from './varietyModal';
const MenuDetails = () => {
  const searchParams = useSearchParams();
  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    toggleModalEdit,
    setIsOpenEdit,
    isOpenEdit,
    isOpenDeleteVariety,
    setIsOpenDeleteVariety,
    toggleModalDeleteVariety,
    isOpenEditVariety,
    setIsOpenEditVariety,
    toggleModalEditVariety,
  } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isOpen, setIsOpen] = useState(false);

  const { ...userRolePermissions } = usePermission();
  const { ...managerRolePermissions } = usePermission();

  const itemId = searchParams.get('itemId') || null;
  const [menuItem, setMenuItem] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [varietyDetails, setVarietyDetails] = useState(null);
  const [isAvailable, setIsAvailable] = useState<Boolean>(menuItem.isAvailable);
  const handleToggle = async (isSelected: boolean) => {
    setIsAvailable(isSelected);
    try {
      const payload = { isAvailable: isSelected };
      const data = await editMenuItem(
        businessInformation[0]?.businessId,
        payload,
        itemId
      );
      if (data?.data?.isSuccessful) {
        // Handle successful update
      } else if (data?.data?.error) {
        setIsAvailable(!isSelected);
        toast.error('An error occurred');
      }
    } catch (error) {
      setIsAvailable(!isSelected);
      toast.error('An error occurred');
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const getMenu = async (loading = true) => {
    setIsLoading(loading);
    const data = await getMenuItem(itemId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      setIsAvailable(data?.data?.data.isAvailable);
      setMenuItem(data?.data?.data);
    } else if (data?.data?.error) {
      //   notify({
      //     title: 'Error!',
      //     text: data?.data?.error,
      //     type: 'error',
      //   });
    }
  };

  useEffect(() => {
    getMenu();
  }, []);

  return (
    <>
      <div className='xl:flex block justify-between'>
        <Link
          href={'/dashboard/menu'}
          className={`cursor-pointer text-primaryColor flex gap-2 xl:mb-0 mb-2 text-sm items-center`}
        >
          <IoIosArrowRoundBack className='text-[22px]' />
          <span className='text-sm'>Back to menu</span>
        </Link>
        <div className='gap-6 xl:flex block'>
          {/* <div className='bg-primaryGrey inline-flex px-4 py-2 rounded-lg  gap-3 items-center'>
            <span
              className={!isAvailable ? 'text-primaryColor' : 'text-grey600'}
            >
              Unavailable
            </span>

            <Switch
              classNames={{
                wrapper: 'm-0 !bg-primaryColor',
              }}
              defaultChecked={isAvailable}
              onChange={(e) => handleToggle(e.target.checked)}
              value={isAvailable}
              aria-label='Toggle availability'
            />

            <span
              className={isAvailable ? 'text-primaryColor' : 'text-grey600'}
            >
              Available
            </span>
          </div> */}
          <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
            {managerRolePermissions?.canEditMenu &&
              userRolePermissions?.canEditMenu !== false && (
                <>
                  <Button
                    onClick={toggleModalEdit}
                    className='flex text-grey600 bg-white'
                  >
                    <FaEdit className='text-[18px]' />
                    <p>Edit</p>
                  </Button>
                  <Button
                    onClick={toggleModal}
                    className='flex text-grey600 bg-white'
                  >
                    <MdCreate className='text-[18px]' />

                    <p> Create Variety</p>
                  </Button>
                </>
              )}

            {managerRolePermissions?.canDeleteMenu &&
              userRolePermissions?.canDeleteMenu !== false && (
                <Button
                  onClick={toggleModalDelete}
                  className='flex text-grey600 bg-white'
                >
                  <RiDeleteBin6Line className='text-[18px]' />
                  <p>Delete</p>
                </Button>
              )}
          </ButtonGroup>
        </div>
      </div>
      <Spacer y={5} />

      {isLoading ? (
        <CustomLoading />
      ) : (
        <div className='flex  xl:flex-row flex-col'>
          <div className={`h-[564px]  xl:w-1/2 w-full  xl:mt-0 mt-4 `}>
            <Image
              src={
                menuItem?.image
                  ? `data:image/jpeg;base64,${menuItem?.image}`
                  : noImage
              }
              width={200}
              height={200}
              style={{ objectFit: 'cover' }}
              className={'bg-contain h-full rounded-lg w-full'}
              aria-label='uploaded image'
              alt='uploaded image(s)'
            />
          </div>
          <div className='flex-grow xl:w-1/2 w-full xl:p-6 p-0 '>
            <h1 className='text-[28px] font-semibold'>{menuItem?.menuName}</h1>
            <Spacer y={5} />
            <p className='text-sm font-sm text-grey600 xl:w-[360px] w-full'>
              {menuItem?.itemDescription}
            </p>
            <Spacer y={5} />
            <p className=' font-[700] '>{formatPrice(menuItem?.price)}</p>
            <Spacer y={5} />
            <p className='text-grey600 text-sm'>{menuItem?.itemName}</p>
            <Spacer y={10} />

            {!menuItem?.varieties && <p className='font-[700]'>Varieties</p>}
            <Spacer y={1} />
            {menuItem?.varieties?.length > 0 ? (
              <div className='border-[#EAECF0] text-sm border rounded-lg '>
                <div className='flex justify-between border-b border-b-[#EAECF0] p-3 items-center'>
                  <p className='font-[700]'>
                    Variety{' '}
                    <span className='text-grey600 font-[500]'>
                      {menuItem?.varieties?.length}
                    </span>
                  </p>
                  {managerRolePermissions?.canEditMenu &&
                    userRolePermissions?.canEditMenu !== false && (
                      <div>
                        <CustomButton
                          onClick={toggleModal}
                          className='bg-white text-primaryColor font-[700] flex gap-1'
                        >
                          <GoPlus className='text-[20px] font-[700]' />
                          <span>Create variety</span>
                        </CustomButton>
                      </div>
                    )}
                </div>
                <div className='h-[250px] overflow-scroll'>
                  {menuItem?.varieties.map((item, index) => {
                    return (
                      <>
                        <div
                          key={index}
                          className='rounded-lg  p-3 text-sm text-black  flex justify-between'
                        >
                          <div className='p-1'>
                            <p className=' font-[700]'>{menuItem?.itemName}</p>
                            <Spacer y={2} />
                            <p className='text-grey600 text-sm'>{item.unit}</p>
                            <Spacer y={2} />
                            <p className='font-[700]'>
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className='flex items-center'>
                            <Tooltip color='secondary' content={'Edit'}>
                              <span>
                                <FaRegEdit
                                  onClick={() => {
                                    toggleModalEditVariety();
                                    setVarietyDetails(item);
                                  }}
                                  className='text-[20px] text-grey500 mr-4 cursor-pointer'
                                />
                              </span>
                            </Tooltip>
                            <Tooltip color='danger' content={'Delete'}>
                              <span>
                                <RiDeleteBin6Line
                                  onClick={() => {
                                    toggleModalDeleteVariety();
                                    setVarietyDetails(item);
                                  }}
                                  className='text-[20px] text-[#dc2626] mr-4 cursor-pointer'
                                />
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className='text-grey600 text-sm'>No varieties</p>
            )}
          </div>
        </div>
      )}
      <VarietyModal
        menuItem={menuItem}
        isOpen={isOpen}
        getMenu={getMenu}
        toggleModal={toggleModal}
      />
      <DeleteMenu
        menuItem={menuItem}
        isOpenDelete={isOpenDelete}
        toggleModalDelete={toggleModalDelete}
      />
      <DeleteVariety
        getMenu={getMenu}
        varietyDetails={varietyDetails}
        isOpenDeleteVariety={isOpenDeleteVariety}
        toggleModalDeleteVariety={toggleModalDeleteVariety}
      />
      <EditVariety
        menuItem={menuItem}
        getMenu={getMenu}
        varietyDetails={varietyDetails}
        isOpenEditVariety={isOpenEditVariety}
        toggleModalEditVariety={toggleModalEditVariety}
      />
      <EditMenu
        getMenu={getMenu}
        menuItem={menuItem}
        isOpenEdit={isOpenEdit}
        toggleModalEdit={toggleModalEdit}
      />
    </>
  );
};

export default MenuDetails;
