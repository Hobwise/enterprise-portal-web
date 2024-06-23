import { uploadFile } from '@/app/api/controllers/dashboard/menu';
import {
  editReservations,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import {
  SmallLoader,
  THREEMB,
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
} from '@nextui-org/react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';

const EditReservation = ({
  isOpenEdit,
  toggleModalEdit,
  reservationItem,
  getReservation,
}: any) => {
  const { refetch } = useReservation();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageError, setImageError] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const [reservationState, setReservationState] =
    useState<payloadReservationItem>({
      reservationName: reservationItem?.reservationName || '',
      reservationDescription: reservationItem?.reservationDescription || '',
      reservationFee: +reservationItem?.reservationFee || 0,
      minimumSpend: reservationItem?.minimumSpend || 0,
      quantity: reservationItem?.quantity || 0,
      imageReference: reservationItem?.imageReference || '',
    });
  useEffect(() => {
    setReservationState({
      reservationName: reservationItem?.reservationName,
      reservationDescription: reservationItem?.reservationDescription,
      reservationFee: +reservationItem?.reservationFee,
      minimumSpend: reservationItem?.minimumSpend,
      quantity: reservationItem?.quantity,
      imageReference: reservationItem?.imageReference || '',
    });
  }, [reservationItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setReservationState((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const menuFileUpload = async (formData: FormData, file) => {
    setIsLoadingImage(true);
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage(false);
    setImageError('');
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setReservationState({
        ...reservationState,
        imageReference: data.data.data,
      });
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

  const reservationRequirement = () => {
    if (reservationState.reservationFee) {
      return 0;
    } else if (reservationState.minimumSpend) {
      return 1;
    } else if (
      reservationState.minimumSpend &&
      reservationState.reservationFee
    ) {
      return 3;
    } else {
      return 2;
    }
  };

  const updateReservation = async (loading = true) => {
    loading && setIsLoading(true);
    const payload = {
      reservationName: reservationState?.reservationName,
      reservationDescription: reservationState?.reservationDescription,
      reservationFee: +reservationState?.reservationFee,
      minimumSpend: reservationState?.minimumSpend,
      quantity: reservationState?.quantity,
      reservationRequirement: reservationRequirement(),
      imageReference: reservationState?.imageReference,
    };

    const data = await editReservations(
      businessInformation[0]?.businessId,
      payload,
      reservationItem?.id
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      toggleModalEdit();
      getReservation();
      refetch();
      toast.success('Reservation updated successfully');
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
        setReservationState({
          reservationName: reservationItem?.reservationName || '',
          reservationDescription: reservationItem?.reservationDescription || '',
          reservationFee: +reservationItem?.reservationFee || 0,
          minimumSpend: reservationItem?.minimumSpend || 0,
          quantity: reservationItem?.quantity || 0,
          imageReference: reservationItem?.imageReference || '',
        });
        setSelectedImage('');
        toggleModalEdit();
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h1 className=' text-xl mt-3 font-[600] text-black'>
                Edit Reservation
              </h1>
              <div className='flex xl:flex-row flex-col gap-6'>
                <div className={`flex-grow xl:h-auto xl:w-1/2 w-full `}>
                  <label className='flex xl:my-2 m-0 justify-between  bg-white'>
                    <p className='text-[#475467] text-[14px] font-[400]'>
                      Maximum of 3MB
                    </p>
                  </label>
                  <div
                    className={`xl:h-[calc(100%-2rem)] bg-[#F9F8FF] h-[200px] border   mt-2 rounded-md ${
                      imageError ? 'border-danger-600' : 'border-[#F5F5F5]'
                    }   text-sm font-[400] text-center`}
                  >
                    {selectedImage || reservationState?.imageReference ? (
                      <>
                        <Image
                          src={
                            selectedImage ||
                            `data:image/jpeg;base64,${reservationItem?.image}`
                          }
                          style={{ objectFit: 'cover' }}
                          width={150}
                          height={150}
                          className='object-cover h-full rounded-lg w-full'
                          aria-label='uploaded image'
                          alt='uploaded image(s)'
                        />
                        <span
                          onClick={() => {
                            setSelectedImage('');
                            setReservationState({
                              ...reservationState,
                              imageReference: '',
                            });
                          }}
                          className='text-danger-500 float-left cursor-pointer'
                        >
                          Remove
                        </span>
                      </>
                    ) : (
                      <div className='flex flex-col h-full justify-center items-center'>
                        <div className='flex flex-col mt-0  text-center xl:w-[240px]  w-full gap-2 justify-center items-center'>
                          {isLoadingImage ? (
                            <SmallLoader />
                          ) : (
                            <>
                              <MdOutlineAddPhotoAlternate className='text-[42px] text-primaryColor' />
                              <span>
                                Drag and drop files to upload or{' '}
                                <span className='text-primaryColor'>
                                  click here
                                </span>{' '}
                                to browse
                              </span>
                            </>
                          )}
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
                <div className='flex-grow  xl:w-1/2 w-full mt-3'>
                  <CustomInput
                    type='text'
                    value={reservationState.reservationName}
                    errorMessage={response?.errors?.reservationName?.[0]}
                    onChange={handleInputChange}
                    name='reservationName'
                    label='Name of reservation'
                    placeholder='name of reservation'
                  />
                  <Spacer y={6} />
                  <CustomTextArea
                    value={reservationState.reservationDescription}
                    name='reservationDescription'
                    onChange={handleInputChange}
                    label='Add a description for this reservation'
                    placeholder='Add a description'
                  />
                  <Spacer y={6} />
                  <div className='flex gap-6'>
                    <CustomInput
                      type='number'
                      startContent={<div className='text-black'>₦</div>}
                      name='reservationFee'
                      errorMessage={response?.errors?.reservationFee?.[0]}
                      onChange={handleInputChange}
                      value={`${reservationState.reservationFee}`}
                      label='Reservation fee'
                      placeholder='Reservation fee'
                    />

                    <CustomInput
                      type='number'
                      startContent={<div className='text-black'>₦</div>}
                      name='minimumSpend'
                      errorMessage={response?.errors?.minimumSpend?.[0]}
                      onChange={handleInputChange}
                      value={`${reservationState.minimumSpend}`}
                      label='Minimum spend'
                      placeholder='Minimum spend'
                    />
                  </div>
                  <Spacer y={6} />
                  <CustomInput
                    type='number'
                    name='quantity'
                    errorMessage={response?.errors?.quantity?.[0]}
                    onChange={handleInputChange}
                    value={`${reservationState.quantity}`}
                    label={'Quantity'}
                    placeholder={'Quantity'}
                  />
                  <Spacer y={6} />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <CustomButton
                className='w-32 mb-3 font-bold text-white'
                loading={isLoading}
                onClick={updateReservation}
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

export default EditReservation;
