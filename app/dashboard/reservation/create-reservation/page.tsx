'use client';
import { deleteFile, uploadFile } from '@/app/api/controllers/dashboard/menu';
import {
  createReservations,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import {
  SmallLoader,
  THREEMB,
  clearItemLocalStorage,
  getFromLocalStorage,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
  saveJsonItemToLocalStorage,
  saveToLocalStorage,
} from '@/lib/utils';
import { InfoCircle } from '@/public/assets/svg';
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  Switch,
  useDisclosure,
} from '@nextui-org/react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
import Success from '../../../../public/assets/images/success.png';

const AddNewReservation = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const getReservationSavedToDraft = getJsonItemFromLocalStorage(
    'saveReservationToDraft'
  );
  const selectedImageSavedToDraft = getFromLocalStorage('selectedImage');
  const { refetch } = useReservation();
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [response, setResponse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(
    selectedImageSavedToDraft || ''
  );

  const [reservationPayload, setReservationPayload] =
    useState<payloadReservationItem>({
      reservationName: getReservationSavedToDraft?.reservationName || '',
      reservationDescription:
        getReservationSavedToDraft?.reservationDescription || '',
      reservationFee: getReservationSavedToDraft?.reservationFee || 0,
      minimumSpend: getReservationSavedToDraft?.minimumSpend || 0,
      reservationRequirement:
        getReservationSavedToDraft?.reservationRequirement || '',
      quantity: getReservationSavedToDraft?.quantity || 1,
      imageReference: getReservationSavedToDraft?.imageReference || '',
      allowSystemAdvert: getReservationSavedToDraft?.allowSystemAdvert || true,
      reservationDuration:
        getReservationSavedToDraft?.reservationDuration || null,
    });

  const businessInformation = getJsonItemFromLocalStorage('business');

  const menuFileUpload = async (formData: FormData, file: any) => {
    setIsLoadingImage(true);
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage(false);
    setImageError('');
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setReservationPayload({
        ...reservationPayload,
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
  const removeUploadedFile = async () => {
    const data = await deleteFile(
      businessInformation[0]?.businessId,
      reservationPayload.imageReference
    );

    if (data?.data?.isSuccessful) {
      setSelectedImage('');
      clearItemLocalStorage('selectedImage');
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
    setReservationPayload((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const reservationRequirement = () => {
    if (reservationPayload.reservationFee) {
      return 0;
    } else if (reservationPayload.minimumSpend) {
      return 1;
    } else if (
      reservationPayload.minimumSpend &&
      reservationPayload.reservationFee
    ) {
      return 3;
    } else {
      return 2;
    }
  };
  const postReservation = async () => {
    // if (!selectedImage) {
    //   return setImageError('Upload an image');
    // }

    setIsLoading(true);

    const data = await createReservations(businessInformation[0]?.businessId, {
      ...reservationPayload,
      reservationFee: Number(reservationPayload.reservationFee),
      minimumSpend: Number(reservationPayload.minimumSpend),
      reservationRequirement: reservationRequirement(),
      quantity: Number(reservationPayload.quantity),
    });

    setResponse(data);

    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      onOpen();
      clearItemLocalStorage('saveReservationToDraft');
      clearItemLocalStorage('selectedImage');
      setReservationPayload({
        reservationName: '',
        reservationDescription: '',
        reservationFee: 0,
        minimumSpend: 0,
        reservationRequirement: '',
        allowSystemAdvert: true,
        reservationDuration: null,
        quantity: 1,
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

  const saveToDraft = () => {
    saveJsonItemToLocalStorage('saveReservationToDraft', reservationPayload);
    saveToLocalStorage('selectedImage', selectedImage);
    toast.success('Saved to draft!');
  };
  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    setReservationPayload((prevState) => ({
      ...prevState,
      quantity:
        type === 'increment'
          ? Number(prevState.quantity || 0) + 1
          : Math.max(1, Number(prevState.quantity || 0) - 1),
    }));
  };

  useEffect(() => {
    setReservationPayload({
      reservationName: getReservationSavedToDraft?.reservationName || '',
      reservationDescription:
        getReservationSavedToDraft?.reservationDescription || '',
      reservationFee: getReservationSavedToDraft?.reservationFee || 0,
      minimumSpend: getReservationSavedToDraft?.minimumSpend || 0,
      reservationRequirement:
        getReservationSavedToDraft?.reservationRequirement || '',
      quantity: getReservationSavedToDraft?.quantity || 1,
      imageReference: getReservationSavedToDraft?.imageReference || '',
      allowSystemAdvert: getReservationSavedToDraft?.allowSystemAdvert || true,
      reservationDuration:
        getReservationSavedToDraft?.reservationDuration || '',
    });
    setSelectedImage(selectedImageSavedToDraft || '');
  }, []);

  const duration = [
    {
      label: '1hr',
      value: 1,
    },
    {
      label: '1hr 30m',
      value: 1.5,
    },
    { label: '2hrs', value: 2 },
    {
      label: '2hrs 30m',
      value: 2.5,
    },
    {
      label: '3hrs',
      value: 3,
    },
  ];

  const handleDurationSelect = (value: number) => {
    setReservationPayload((prev) => ({
      ...prev,
      reservationDuration:
        prev.reservationDuration === value ? undefined : value,
    }));
  };

  const handleToggle = async (isSelected: boolean) => {
    setReservationPayload({
      ...reservationPayload,
      allowSystemAdvert: isSelected,
    });
  };

  return (
    <>
      <div className='flex  justify-between '>
        <div>
          <h1 className='text-[24px] leading-8 font-semibold'>
            {' '}
            Create a new reservation
          </h1>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Setup a new reservation.
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          className=' text-grey600 bg-white'
        >
          <IoIosArrowRoundBack className='text-[22px]' />
          <p>Go back</p>
        </Button>
      </div>
      <div className='flex lg:flex-row flex-col'>
        <div className='flex-grow lg:w-1/2 w-full lg:p-6 p-0 xl:border border-[#F5F5F5] rounded-tl-lg rounded-bl-lg'>
          <CustomInput
            type='text'
            value={reservationPayload.reservationName}
            errorMessage={response?.errors?.reservationName?.[0]}
            onChange={handleInputChange}
            name='reservationName'
            label='Name of reservation'
            placeholder='name of reservation'
          />
          <Spacer y={6} />
          <CustomTextArea
            value={reservationPayload.reservationDescription}
            name='reservationDescription'
            errorMessage={response?.errors?.reservationDescription?.[0]}
            onChange={handleInputChange}
            label='Add a description for this reservation'
            placeholder='Add a description'
          />
          <Spacer y={6} />
          <div className='flex lg:flex-row flex-col gap-6'>
            <CustomInput
              type='text'
              disabled={true}
              startContent={<div>₦</div>}
              endContent={
                <div className='text-xs  whitespace-nowrap text-white text-center px-2 py-[2px] bg-success-500 rounded-full '>
                  Coming soon
                </div>
              }
              name='reservationFee'
              errorMessage={response?.errors?.reservationFee?.[0]}
              onChange={handleInputChange}
              value={`${reservationPayload.reservationFee}`}
              label='Reservation fee'
              placeholder='Reservation fee'
            />

            <CustomInput
              type='text'
              startContent={<div>₦</div>}
              name='minimumSpend'
              errorMessage={response?.errors?.minimumSpend?.[0]}
              onChange={handleInputChange}
              value={`${reservationPayload.minimumSpend}`}
              label='Minimum spend'
              placeholder='Minimum spend'
            />
          </div>

          <Spacer y={6} />
          <div className='text-sm flex justify-between'>
            <div className='text-[#404245] flex space-x-2 items-center'>
              <p>Quantity</p>
              <InfoCircle />
            </div>
            <div className='flex space-x-4 text-[#000] items-center'>
              <button
                className='border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8'
                disabled={Number(reservationPayload.quantity) <= 1}
                role='button'
                onClick={() => handleQuantityChange('decrement')}
              >
                -
              </button>
              <p className='font-medium w-4 flex justify-center items-center'>
                {reservationPayload.quantity || 1}
              </p>
              <button
                className='border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8'
                role='button'
                onClick={() => handleQuantityChange('increment')}
              >
                +
              </button>
            </div>
          </div>
          <Spacer y={6} />
          <div className='bg-[#F0F2F4] p-4 text-[#5A5A63]  items-baseline space-x-2 space-y-2 rounded-lg'>
            <p className='text-sm'>
              Duration: Select a duration if this reservation is time-sensitive.
              (Optional)
            </p>
            <div className='flex justify-between items-center'>
              <div className='flex gap-2'>
                {duration.map((item) => (
                  <Chip
                    key={item.value}
                    onClick={() => handleDurationSelect(item.value)}
                    className={`cursor-pointer transition-colors ${
                      reservationPayload.reservationDuration === item.value
                        ? 'bg-primaryColor text-white'
                        : 'bg-white text-[#5A5A63]'
                    }`}
                    classNames={{
                      base: 'text-xs h-7',
                      content: 'px-3',
                    }}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>

              {/* <MdCancel
                onClick={() =>
                  setReservationPayload({
                    ...reservationPayload,
                    reservationDuration: null,
                  })
                }
                className='text-danger-500 cursor-pointer text-xl'
              /> */}
            </div>
            <Spacer y={3} />
            <hr className='my-4 text-secondaryGrey' />
            <Spacer y={3} />
            <p className='text-sm'>
              Allow System Advertisement: Disable this option if you do not wish
              for the system to promote this reservation.
            </p>
            <div className='bg-primaryGrey inline-flex px-4 py-2 rounded-lg  gap-3 items-center'>
              <span
                className={
                  !reservationPayload.allowSystemAdvert
                    ? 'text-primaryColor text-bold text-sm'
                    : 'text-grey400 text-sm'
                }
              >
                Disable
              </span>

              <Switch
                size='sm'
                classNames={{
                  wrapper: `m-0 ${
                    reservationPayload.allowSystemAdvert
                      ? '!bg-primaryColor'
                      : 'bg-[#E4E7EC]'
                  } `,
                }}
                name='allowSystemAdvert'
                defaultChecked={reservationPayload.allowSystemAdvert}
                onChange={(e) => handleToggle(e.target.checked)}
                isSelected={reservationPayload.allowSystemAdvert}
                aria-label='allow system advert'
              />

              <span
                className={
                  reservationPayload.allowSystemAdvert
                    ? 'text-primaryColor text-bold text-sm'
                    : 'text-grey400 text-sm'
                }
              >
                Enable
              </span>
            </div>
          </div>
        </div>
        <div
          className={`flex-grow xl:h-auto lg:w-1/2 full  p-0  xl:mt-0 mt-4 xl:border border-[#F5F5F5]  rounded-tr-lg rounded-br-lg`}
        >
          <label className='flex xl:mx-4 xl:my-2 m-0 justify-between  bg-white'>
            <div>
              <p className='font-[500] text-[14px]'>Image</p>
              <p className=' text-grey400 text-[12px]'>
                Add an image to this campaign
              </p>
            </div>
            <p className='text-[#475467] text-[14px] font-[400]'>
              Maximum of 3MB
            </p>
          </label>
          <div
            className={`lg:h-[calc(100%-5rem)] bg-[#F9F8FF] h-[200px] border  xl:m-4 mt-2 rounded-md ${
              imageError ? 'border-danger-600' : 'border-[#F5F5F5]'
            }   text-sm font-[400] text-center relative`}
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
                  <div className='flex flex-col mt-0 text-black text-center xl:w-[240px]  w-full gap-2 justify-center items-center'>
                    {isLoadingImage ? (
                      <SmallLoader />
                    ) : (
                      <>
                        <MdOutlineAddPhotoAlternate className='text-[42px] text-primaryColor' />
                        <span className='text-black'>
                          Drag and drop files to upload or{' '}
                          <span className='text-primaryColor'>click here</span>{' '}
                          to browse
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    title='upload an image'
                    alt='upload a reservation'
                    type='file'
                    id='reservation-upload'
                    accept='image/*'
                    onChange={(event) => handleImageChange(event)}
                    className='h-full w-full opacity-0 cursor-pointer absolute top-0'
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
      <div className='flex justify-end gap-3'>
        <CustomButton
          className='w-32  text-black bg-transparent border rounded-lg border-grey500'
          onClick={saveToDraft}
          type='submit'
        >
          {'Save to draft'}
        </CustomButton>
        <CustomButton
          className='w-36  text-white'
          loading={isLoading}
          onClick={postReservation}
          type='submit'
        >
          {isLoading ? 'Loading' : 'Add Reservation'}
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
                  Your reservation has been created
                </h3>

                <div className='flex gap-3'>
                  <CustomButton
                    onClick={async () => {
                      await refetch();
                      router.push('/dashboard/reservation');
                    }}
                    className='h-[49px] md:mb-0 w-full flex-grow text-black border border-[#D0D5DD] mb-4 '
                    backgroundColor='bg-white'
                    type='submit'
                  >
                    View reservations
                  </CustomButton>
                  <CustomButton
                    className='text-white h-[49px]  flex-grow w-full'
                    onClick={onClose}
                    type='submit'
                  >
                    Add another reservation
                  </CustomButton>
                </div>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddNewReservation;
