'use client';
import {
  createMenuItem,
  deleteFile,
  getMenu,
  payloadMenuItem,
  uploadFile,
} from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import Container from '@/components/dashboardContainer';
import SelectInput from '@/components/selectInput';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
import {
  THREEMB,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
} from '@/lib/utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  useDisclosure,
} from '@nextui-org/react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdOutlineAddPhotoAlternate,
  MdOutlineFileDownload,
} from 'react-icons/md';
import Success from '../../../../public/assets/images/success.png';
import AddMultipleMenu from './add-mulitple-menuItem/addMultipleMenu';
import SelectMenu from './add-mulitple-menuItem/selectMenu';

const AddItemToMenu = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { refetch } = useMenu();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('');

  const [imageError, setImageError] = useState('');
  const [response, setResponse] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeScreen, setActiveScreen] = useState(1);
  const [isOpenMultipleMenu, setIsOpenMultipleMenu] = useState(false);

  const toggleMultipleMenu = () => {
    setIsOpenMultipleMenu(!isOpenMultipleMenu);
  };

  const [menu, setMenu] = useState([]);
  const [menuItem, setMenuItem] = useState<payloadMenuItem>({
    itemDescription: '',
    itemName: '',
    price: 0,
    menuID: '',
    isAvailable: true,
    imageReference: '',
  });

  const businessInformation = getJsonItemFromLocalStorage('business');
  const getMenuName = async () => {
    const data = await getMenu(businessInformation[0]?.businessId);

    if (data?.data?.isSuccessful) {
      const newData = data?.data?.data.map((item) => ({
        ...item,
        label: item.name,
        value: item.id,
      }));

      setMenu(newData);
    } else if (data?.data?.error) {
      //   notify({
      //     title: 'Error!',
      //     text: data?.data?.error,
      //     type: 'error',
      //   });
    }
  };

  const menuFileUpload = async (formData: FormData, file) => {
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setImageError('');
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setMenuItem({ ...menuItem, imageReference: data.data.data });
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  const removeUploadedFile = async () => {
    const data = await deleteFile(
      businessInformation[0]?.businessId,
      menuItem.imageReference
    );

    if (data?.data?.isSuccessful) {
      setSelectedImage('');
      toast.success('Image removed');
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const handleImageChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return setImageError('File too large');
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append('file', compressedFile);
      menuFileUpload(formData, file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setMenuItem((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const postMenuItem = async () => {
    // if (!selectedImage) {
    //   return setImageError('Upload an image');
    // }

    setIsLoading(true);
    const payload = {
      menuID: menuItem.menuID,
      itemName: menuItem.itemName,
      itemDescription: menuItem.itemDescription,
      price: +menuItem.price,
      isAvailable: menuItem.isAvailable,
      imageReference: menuItem.imageReference,
    };

    const data = await createMenuItem(
      businessInformation[0]?.businessId,
      payload
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      onOpen();
      setMenuItem({
        itemDescription: '',
        itemName: '',
        price: 0,
        menuID: '',
        imageReference: '',
      });
      // setSelectedFile();
      setSelectedImage('');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getMenuName();
  }, []);
  return (
    <Container>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start'>
        <div>
          <h1 className='text-[24px] leading-8 font-semibold'>Add menu item</h1>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Add an item to your menu.
          </p>
        </div>
        <CustomButton
          onClick={toggleMultipleMenu}
          className='py-2 px-4 md:mb-0 text-black border border-[#D0D5DD] mb-4 '
          backgroundColor='bg-white'
        >
          <div className='flex gap-2 items-center justify-center'>
            <MdOutlineFileDownload className='text-[22px]' />
            <p> Add multiple items</p>
          </div>
        </CustomButton>
      </div>
      <div className='flex xl:flex-row flex-col'>
        <div className='flex-grow xl:w-1/2 w-full xl:p-6 p-0 xl:border border-[#F5F5F5] rounded-tl-lg rounded-bl-lg'>
          <CustomInput
            type='text'
            value={menuItem.itemName}
            errorMessage={response?.errors?.itemName?.[0]}
            onChange={handleInputChange}
            name='itemName'
            label='Name of item'
            placeholder='E.g Drinks'
          />
          <Spacer y={6} />
          <CustomTextArea
            value={menuItem.itemDescription}
            name='itemDescription'
            onChange={handleInputChange}
            label='Add a description'
            placeholder=''
          />
          <Spacer y={6} />
          <CustomInput
            type='text'
            name='price'
            errorMessage={response?.errors?.price?.[0]}
            onChange={handleInputChange}
            value={`${menuItem.price}`}
            label='Add a price'
            placeholder='Add a price'
          />
          <Spacer y={6} />
          <SelectInput
            errorMessage={response?.errors?.menuID?.[0]}
            label={'Select a menu'}
            name='menuID'
            onChange={handleInputChange}
            value={menuItem.menuID}
            placeholder={'Select...'}
            contents={menu}
          />
        </div>
        <div
          className={`flex-grow xl:h-auto xl:w-1/2 full Xl:p-8 p-0  xl:mt-0 mt-4 xl:border border-[#F5F5F5]  rounded-tr-lg rounded-br-lg`}
        >
          <label className='flex xl:m-4 m-0 justify-between  bg-white'>
            <p className='font-[500] text-[14px]'>Image</p>
            <p className='text-[#475467] text-[14px] font-[400]'>
              Maximum of 3MB
            </p>
          </label>
          <div
            className={`xl:h-[calc(100%-4.5rem)] h-[200px] border  xl:m-4 mt-2 rounded-md ${
              imageError ? 'border-danger-600' : 'border-[#F5F5F5]'
            }   text-sm font-[400] text-center`}
          >
            {selectedImage ? (
              <>
                <Image
                  src={selectedImage}
                  width={200}
                  height={200}
                  className='object-cover h-full rounded-md w-full'
                  aria-label='uploaded image'
                  alt='uploaded image(s)'
                />
                <span
                  onClick={removeUploadedFile}
                  className='text-danger-500 float-left cursor-pointer'
                >
                  Remove
                </span>
              </>
            ) : (
              <>
                <div className='flex flex-col h-full justify-center items-center'>
                  <div className='flex flex-col mt-0  text-center xl:w-[240px]  w-full gap-2 justify-center items-center'>
                    <MdOutlineAddPhotoAlternate className='text-[42px] text-primaryColor' />
                    <span>
                      Drag and drop files to upload or{' '}
                      <span className='text-primaryColor'>click here</span> to
                      browse
                    </span>
                  </div>
                  <input
                    title='upload an image'
                    alt='upload a menu'
                    type='file'
                    id='menu-upload'
                    accept='image/*'
                    onChange={(event) => handleImageChange(event)}
                    className='h-[100%] opacity-0 cursor-pointer absolute top-0'
                  />
                </div>
              </>
            )}

            <span className='text-sm float-left text-danger-600'>
              {imageError}
            </span>
          </div>
        </div>
      </div>
      <Spacer y={1} />
      <div className='flex justify-end'>
        <CustomButton
          className='w-32  text-white'
          loading={isLoading}
          onClick={postMenuItem}
          type='submit'
        >
          {isLoading ? 'Loading' : 'Add to menu'}
        </CustomButton>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className='grid place-content-center mt-8'>
                  <Image src={Success} alt='success' />
                </div>

                <h2 className='text-[16px] text-center leading-3 mt-3 text-black font-semibold'>
                  Fantastic!
                </h2>
                <h3 className='text-sm text-center text-grey600     mb-4'>
                  Your item has been added to the menu
                </h3>

                <div className='flex gap-3'>
                  <CustomButton
                    onClick={async () => {
                      await refetch();
                      router.push('/dashboard/menu');
                    }}
                    className='h-[49px] md:mb-0 w-full flex-grow text-black border border-[#D0D5DD] mb-4 '
                    backgroundColor='bg-white'
                    type='submit'
                  >
                    View menu
                  </CustomButton>
                  <CustomButton
                    className='text-white h-[49px]  flex-grow w-full'
                    onClick={onClose}
                    type='submit'
                  >
                    Add another item
                  </CustomButton>
                </div>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size='xl'
        isOpen={isOpenMultipleMenu}
        onOpenChange={() => {
          setActiveScreen(1);
          setSelectedMenu('');
          toggleMultipleMenu();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                {activeScreen === 1 && (
                  <SelectMenu
                    setActiveScreen={setActiveScreen}
                    setSelectedMenu={setSelectedMenu}
                    selectedMenu={selectedMenu}
                    toggleMultipleMenu={toggleMultipleMenu}
                  />
                )}
                {activeScreen === 2 && (
                  <AddMultipleMenu selectedMenu={selectedMenu} />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AddItemToMenu;
