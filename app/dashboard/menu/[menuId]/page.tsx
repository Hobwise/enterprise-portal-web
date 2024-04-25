'use client';

import Container from '@/components/dashboardContainer';
import {
  Button,
  ButtonGroup,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  Switch,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { FaEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MdCreate } from 'react-icons/md';
import { useSearchParams } from 'next/navigation';
import { useGlobalContext } from '@/hooks/globalProvider';
import Image from 'next/image';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  editMenuItem,
  getMenuItem,
} from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import VarietyModal from './varietyModal';
import { GoPlus } from 'react-icons/go';
import DeleteMenu from './deleteMenu';
import EditMenu from './editMenu';
import hobink from '../../../../public/assets/images/hobink.png';
import noImage from '../../../../public/assets/images/no-image.jpg';
import { toast } from 'react-toastify';
import DeleteVariety from './deleteVariety';
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
  } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [isOpen, setIsOpen] = useState(false);

  const itemId = searchParams.get('itemId') || null;
  const [menuItem, setMenuItem] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [varietyDetails, setVarietyDetails] = useState(null);
  const [isAvailable, setIsAvailable] = useState<Boolean>(
    menuItem.isAvailabale
  );
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
      console.error('Error updating menu item:', error);
      setIsAvailable(!isSelected);
      toast.error('An error occurred');
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const getMenu = async () => {
    setIsLoading(true);
    const data = await getMenuItem(itemId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      setIsAvailable(data?.data?.data.isAvailabale);
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
    <Container>
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
            <Button
              onClick={toggleModalDelete}
              className='flex text-grey600 bg-white'
            >
              <RiDeleteBin6Line className='text-[18px]' />
              <p>Delete</p>
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <Spacer y={5} />
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
            className='bg-contain h-full rounded-lg w-full'
            aria-label='uploaded image'
            alt='uploaded image(s)'
          />
        </div>
        <div className='flex-grow xl:w-1/2 w-full xl:p-6 p-0 '>
          <h1 className='text-[28px] font-semibold'>{menuItem?.itemName}</h1>
          <Spacer y={5} />
          <p className='text-sm font-sm text-grey600 xl:w-[360px] w-full'>
            {menuItem?.itemDescription}
          </p>
          <Spacer y={5} />
          <p className=' font-[700] '>₦{menuItem?.price}</p>
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
                <div>
                  <CustomButton
                    onClick={toggleModal}
                    className='bg-white text-primaryColor font-[700] flex gap-1'
                  >
                    <GoPlus className='text-[20px] font-[700]' />
                    <span>Create variety</span>
                  </CustomButton>
                </div>
              </div>
              {menuItem?.varieties.map((item, index) => {
                return (
                  <>
                    <div
                      key={index}
                      className='rounded-lg p-3 text-sm text-black  flex justify-between'
                    >
                      <div className='p-1'>
                        <p className=' font-[700]'>{menuItem?.itemName}</p>
                        <Spacer y={2} />
                        <p className='text-grey600 text-sm'>{item.unit}</p>
                        <Spacer y={2} />
                        <p className='font-[700]'>₦{item.price}</p>
                      </div>
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
                  </>
                );
              })}
            </div>
          ) : (
            <p className='text-grey600 text-sm'>No varieties</p>
          )}
        </div>
      </div>
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
      <EditMenu
        getMenu={getMenu}
        menuItem={menuItem}
        isOpenEdit={isOpenEdit}
        toggleModalEdit={toggleModalEdit}
      />
    </Container>
  );
};

export default MenuDetails;
