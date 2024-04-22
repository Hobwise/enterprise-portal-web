import {
  editMenuItem,
  getMenu,
  payloadMenuItem,
  uploadFile,
} from '@/app/api/controllers/dashboard/menu';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import {
  ONEMB,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
} from '@/lib/utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spacer,
  Switch,
} from '@nextui-org/react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';

const EditMenu = ({ isOpenEdit, toggleModalEdit, menuItem, getMenu }: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageError, setImageError] = useState('');

  const [menuItemState, setMenuItemState] = useState<payloadMenuItem>({
    itemDescription: menuItem?.itemDescription || '',
    itemName: menuItem?.itemName || '',
    price: +menuItem?.price || 0,
    menuID: menuItem?.menuID || '',
    isAvailable: menuItem?.isAvailabale || true,
    imageReference: '',
  });
  useEffect(() => {
    setMenuItemState({
      itemDescription: menuItem?.itemDescription,
      itemName: menuItem?.itemName,
      price: +menuItem?.price,
      menuID: menuItem?.menuID,
      isAvailable: menuItem?.isAvailabale || true,
      imageReference: '',
    });
  }, [menuItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setMenuItemState((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const menuFileUpload = async (formData: FormData, file) => {
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setImageError('');
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setMenuItemState({ ...menuItemState, imageReference: data.data.data });
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
      if (file.size > ONEMB) {
        return setImageError('File too large');
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append('file', compressedFile);
      menuFileUpload(formData, file);
    }
  };
  const handleToggle = async (isSelected: boolean) => {
    setMenuItemState({ ...menuItemState, isAvailable: isSelected });
  };
  const updateMenuItem = async () => {
    setIsLoading(true);
    const payload = {
      menuID: menuItemState.menuID,
      itemName: menuItemState.itemName,
      itemDescription: menuItemState.itemDescription,
      price: +menuItemState.price,
      isAvailable: menuItemState.isAvailable,
      imageReference: menuItemState.imageReference,
      hasVariety: menuItem.hasVariety,
    };

    const data = await editMenuItem(
      businessInformation[0]?.businessId,
      payload,
      menuItem?.id
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      toggleModalEdit();
      getMenu();
      toast.success('Menu item updated successfully');
      setSelectedImage('');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  return (
    <Modal
      size='5xl'
      isOpen={isOpenEdit}
      onOpenChange={() => {
        setMenuItemState({
          itemDescription: menuItem?.itemDescription || '',
          itemName: menuItem?.itemName || '',
          price: +menuItem?.price || 0,
          menuID: menuItem?.menuID || '',
          isAvailable: menuItem?.isAvailabale || '',
          imageReference: '',
        });
        setSelectedImage('');
        toggleModalEdit();
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h1 className='text-center text-xl mt-3 font-[600] text-black'>
                Edit menu items
              </h1>
              <div className='flex xl:flex-row flex-col'>
                <div className={`flex-grow xl:h-auto xl:w-1/2 full mt-4`}>
                  <label className='flex xl:my-2 m-0 justify-between  bg-white'>
                    <p className='font-[500] text-[14px] text-black'>Images</p>
                    <p className='text-[#475467] text-[14px] font-[400]'>
                      Maximum of 1MB
                    </p>
                  </label>
                  <div
                    className={`xl:h-[calc(100%-3.8rem)] h-[200px] border   mt-2 rounded-md ${
                      imageError ? 'border-danger-600' : 'border-[#F5F5F5]'
                    }   text-sm font-[400] text-center`}
                  >
                    {selectedImage ? (
                      <Image
                        src={selectedImage}
                        width={150}
                        height={150}
                        className='object-cover h-full rounded-lg w-full'
                        aria-label='uploaded image'
                        alt='uploaded image(s)'
                      />
                    ) : (
                      <div className='flex flex-col h-full justify-center items-center'>
                        <div className='flex flex-col mt-0  text-center xl:w-[240px]  w-full gap-2 justify-center items-center'>
                          <MdOutlineAddPhotoAlternate className='text-[42px] text-primaryColor' />
                          <span className='text-black'>
                            Drag and drop files to upload or{' '}
                            <span className='text-primaryColor'>
                              click here
                            </span>{' '}
                            to browse
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
                    )}

                    <span className='text-sm float-left text-danger-600'>
                      {imageError}
                    </span>
                  </div>
                </div>
                <div className='flex-grow xl:w-1/2 w-full xl:p-6 p-0 '>
                  <CustomInput
                    type='text'
                    // defaultValue={menuItem?.itemName}
                    value={menuItemState.itemName}
                    errorMessage={response?.errors?.itemName?.[0]}
                    onChange={handleInputChange}
                    name='itemName'
                    label='Name of item'
                    placeholder='E.g Drinks'
                  />
                  <Spacer y={6} />
                  <CustomTextArea
                    // defaultValue={menuItem?.itemDescription}
                    value={menuItemState.itemDescription}
                    name='itemDescription'
                    errorMessage={response?.errors?.itemDescription?.[0]}
                    onChange={handleInputChange}
                    label='Add a description'
                    placeholder=''
                  />
                  <Spacer y={6} />
                  <CustomInput
                    type='text'
                    name='price'
                    // defaultValue={Number(menuItem?.price)}
                    errorMessage={response?.errors?.price?.[0]}
                    onChange={handleInputChange}
                    value={`${menuItemState.price}`}
                    label='Add a price'
                    placeholder='Add a price'
                  />
                  <Spacer y={6} />
                  <div className='bg-primaryGrey inline-flex px-4 py-2 rounded-lg  gap-3 items-center'>
                    <span
                      className={
                        !menuItemState.isAvailable
                          ? 'text-primaryColor'
                          : 'text-grey600'
                      }
                    >
                      Unavailable
                    </span>

                    <Switch
                      classNames={{
                        wrapper: `m-0 ${
                          menuItemState.isAvailable
                            ? '!bg-primaryColor'
                            : 'bg-[#E4E7EC]'
                        } `,
                      }}
                      name='isAvailable'
                      defaultChecked={menuItemState.isAvailable}
                      onChange={(e) => handleToggle(e.target.checked)}
                      isSelected={menuItemState.isAvailable}
                      aria-label='Toggle availability'
                    />

                    <span
                      className={
                        menuItemState.isAvailable
                          ? 'text-primaryColor'
                          : 'text-grey600'
                      }
                    >
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <CustomButton
                className='w-32 mb-3 text-white'
                loading={isLoading}
                onClick={updateMenuItem}
                type='submit'
              >
                {isLoading ? 'Loading' : 'Save'}
              </CustomButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditMenu;
