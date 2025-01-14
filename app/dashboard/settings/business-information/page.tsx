'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CustomButton } from '@/components/customButton';
import { BiEditAlt } from 'react-icons/bi';
import { Avatar, cn, Divider } from '@nextui-org/react';
import { MdLockOutline } from 'react-icons/md';
import { CustomInput } from '@/components/CustomInput';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import {
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  mapBusinessCategory,
  THREEMB,
} from '@/lib/utils';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { RxCross2 } from 'react-icons/rx';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { deleteFile, uploadFile } from '@/app/api/controllers/dashboard/menu';
import { useMutation, useQueryClient } from 'react-query';
import { PiBuildingOffice } from 'react-icons/pi';
import useGetBusiness from '@/hooks/cachedEndpoints/useGetBusiness';
import api from '@/app/api/apiService';
import { AUTH } from '@/app/api/api-url';
import { TbCopy } from 'react-icons/tb';
import States from '@/lib/cities.json';
import SelectInput from '@/components/selectInput';

interface BusinessData {
  [key: string]: any;
}

const BusinessInformation = () => {
  const queryClient = useQueryClient();

  const businessInformation = getJsonItemFromLocalStorage('business');

  const { data: businessData } = useGetBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [businessFormData, setBusinessFormData] = useState<BusinessData | null>(
    null
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const getStates = () => {
    return States.map((state) => ({
      label: state.name,
      value: state.name,
    }));
  };

  const getCities = () => {
    const state = States.find((state) => state.name === businessFormData?.state);

    if (state) {
      return state?.cities.map((city) => ({
        label: city,
        value: city,
      }));
    } else {
      return [];
    }
  };

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      uploadFile(businessInformation[0]?.businessId, formData),
    onSuccess: (data) => {
      if (data?.data?.isSuccessful) {
        setBusinessFormData((prevState: any) => ({
          ...prevState,
          logoImageReference: data?.data.data,
        }));
      } else {
        setPreviewUrl(null);
      }
    },
  });

  const removeFileMutation = useMutation({
    mutationFn: () =>
      deleteFile(
        businessInformation[0]?.businessId,
        businessFormData?.logoImageReference as string
      ),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        setPreviewUrl(null);
        setBusinessFormData((prevState: any) => ({
          ...prevState,
          logoImageReference: '',
        }));
      }
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: () =>
      api.put(AUTH.registerBusiness, businessFormData, {
        headers: {
          businessId: businessInformation[0]?.businessId,
        },
      }),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        onOpen();
        queryClient.invalidateQueries({ queryKey: ['getBusiness'] });
      }
    },
  });

  React.useEffect(() => {
    if (businessData) {
      setBusinessFormData({
        ...businessData,
        businessID: businessInformation[0]?.businessId,
      });
    }
  }, [businessData]);

  const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleFileChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return toast.error('File too large');
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);

      if (compressedFile) {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
      }
      const formData = new FormData();
      formData.append('file', compressedFile);
      uploadFileMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setBusinessFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-[#101928]">Business information</h2>
        <p className="text-sm text-[#667185]">
          See your full business information
        </p>
      </div>
      <div className="border border-secondaryGrey rounded-[10px] p-4 space-y-8">
        <div className="flex items-center justify-between w-full">
          {businessFormData?.logoImage ? (
            <Avatar
              size="lg"
              className="h-[120px] w-[120px]"
              src={`data:image/jpeg;base64,${businessFormData.logoImage}`}
            />
          ) : !previewUrl ? (
            <div className="flex items-center justify-center w-[200px] h-[120px] rounded-[10px] bg-[#5F35D20A]">
              <label
                htmlFor="logo-photo"
                className="flex flex-col items-center justify-center space-y-4"
              >
                <Image
                  src="/assets/icons/video-audio-icon.svg"
                  width={24}
                  height={24}
                  alt="Video audio icon"
                />
                <span className="font-semibold text-[8px] text-primaryColor">
                  No Cover Photo
                </span>
                <input
                  type="file"
                  id="logo-photo"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="relative">
              <Image
                src={previewUrl}
                width={200}
                height={120}
                alt="Business profile"
                objectFit="contain"
                className="w-[200px] h-[120px] object-contain"
              />
              <div
                className="absolute top-0 right-0 cursor-pointer"
                onClick={() => removeFileMutation.mutate()}
              >
                <div className="w-8 h-8 bg-white flex items-center justify-center rounded-[10px]">
                  <RxCross2 />
                </div>
              </div>
            </div>
          )}

          {!isEditing ? (
            <CustomButton
              disableRipple
              className="flex border border-primaryColor rounded-[10px] text-primaryColor text-xs p-2 h-[30px]"
              backgroundColor="bg-transparent"
              onClick={() => setIsEditing((prevState) => !prevState)}
            >
              <BiEditAlt className="text-base" />
              Edit
            </CustomButton>
          ) : (
            <div className="flex">
              <CustomButton
                disableRipple
                loading={updateBusinessMutation.isLoading}
                className="flex  rounded-[10px] text-xs p-2 h-[30px] text-white"
                onClick={() => updateBusinessMutation.mutate()}
              >
                <IoCheckmarkCircleOutline className="text-base" />
                Save Changes
              </CustomButton>
              <CustomButton
                disableRipple
                className="flex rounded-[10px] text-xs p-2 h-[30px] text-danger"
                backgroundColor="bg-transparent"
                onClick={() => setIsEditing(false)}
              >
                <RxCross2 className="text-base" />
                Cancel
              </CustomButton>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PiBuildingOffice className="text-black" />
            <span className="font-medium text-sm">Business Details</span>
          </div>
          <Divider />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 ">
          {!isEditing ? (
            <>
              <div className="col-span-1 flex gap-2 ">
                <MdLockOutline className="mt-1 text-[#AFAFAF]" />
                <div className="flex flex-col">
                  <span className="text-sm">Business Name</span>
                  <span className="text-sm">{businessFormData?.name}</span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2">
                <MdLockOutline className="mt-1 text-[#AFAFAF]" />
                <div className="flex flex-col">
                  <span className="text-sm">Business Category</span>
                  <span className="text-sm">
                    {mapBusinessCategory(businessFormData?.businessCategory)}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 ">
                <MdLockOutline className="mt-1 text-[#AFAFAF]" />
                <div className="flex flex-col">
                  <span className="text-sm">Business Email</span>
                  <span
                    className={cn(
                      'text-sm',
                      businessFormData?.contactEmailAddress.length > 0
                        ? 'text-black'
                        : 'text-red-500'
                    )}
                  >
                    {businessFormData?.contactEmailAddress.length > 0
                      ? businessFormData?.contactEmailAddress
                      : 'Not updated'}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Phone No</span>
                  <span
                    className={cn(
                      'text-sm',
                      businessFormData?.contactPhoneNumber?.length > 0
                        ? 'text-black'
                        : 'text-red-500'
                    )}
                  >
                    {businessFormData?.contactPhoneNumber?.length > 0
                      ? businessFormData?.contactPhoneNumber
                      : 'Not updated'}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Business Address</span>
                  <span
                    className={cn(
                      'text-sm',
                      businessFormData?.address?.length > 0
                        ? 'text-black'
                        : 'text-red-500'
                    )}
                  >
                    {businessFormData?.address?.length > 0
                      ? businessFormData?.address
                      : 'Not updated'}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">LGA</span>
                  <span
                    className={cn(
                      'text-sm',
                      businessFormData?.city?.length > 0
                        ? 'text-black'
                        : 'text-red-500'
                    )}
                  >
                    {businessFormData?.city?.length > 0
                      ? businessFormData?.city
                      : 'Not updated'}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">State</span>
                  <span
                    className={cn(
                      'text-sm',
                      businessFormData?.state?.length > 0
                        ? 'text-black'
                        : 'text-red-500'
                    )}
                  >
                    {businessFormData?.state?.length > 0
                      ? businessFormData?.state
                      : 'Not updated'}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Primary Brand color</span>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-sm',
                        businessFormData?.primaryBrandColour?.length > 0
                          ? 'text-black'
                          : 'text-red-500'
                      )}
                    >
                      {businessFormData?.primaryBrandColour?.length > 0
                        ? businessFormData?.primaryBrandColour
                        : 'Not updated'}
                    </span>

                    {businessFormData?.primaryBrandColour.length > 0 && (
                      <TbCopy
                        onClick={() =>
                          copyTextToClipboard(
                            businessFormData?.primaryBrandColour
                          )
                        }
                        className="text-[20px] cursor-pointer text-grey400"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Secondary Brand color</span>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-sm',
                        businessFormData?.secondaryBrandColour?.length > 0
                          ? 'text-black'
                          : 'text-red-500'
                      )}
                    >
                      {businessFormData?.secondaryBrandColour?.length > 0
                        ? businessFormData?.secondaryBrandColour
                        : 'Not updated'}
                    </span>
                    {businessFormData?.secondaryBrandColour.length > 0 && (
                      <TbCopy
                        onClick={() =>
                          copyTextToClipboard(
                            businessFormData?.secondaryBrandColour
                          )
                        }
                        className="text-[20px] cursor-pointer text-grey400"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-span-1 w-full flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  <CustomInput
                    type="text"
                    name="name"
                    label="Business Name"
                    disabled
                    onChange={handleInputChange}
                    value={businessFormData?.name}
                    placeholder="Business name"
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  <CustomInput
                    type="text"
                    name="businessCategory"
                    disabled
                    value={mapBusinessCategory(
                      businessFormData?.businessCategory
                    )}
                    label="Business Category"
                    placeholder="Business category"
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  <CustomInput
                    type="text"
                    name="contactEmailAddress"
                    disabled
                    // errorMessage={response?.errors?.email?.[0]}
                    onChange={handleInputChange}
                    value={businessFormData?.contactEmailAddress}
                    label="Business Email"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  <CustomInput
                    type="text"
                    name="contactPhoneNumber"
                    // errorMessage={response?.errors?.lastName?.[0]}
                    onChange={handleInputChange}
                    value={businessFormData?.contactPhoneNumber}
                    label="Phone number"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  <CustomInput
                    type="text"
                    name="address"
                    // errorMessage={response?.errors?.lastName?.[0]}
                    value={businessFormData?.address}
                    label="Business Address"
                    placeholder="Enter business address"
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  {/* <CustomInput
                    type="text"
                    name="city"
                    disabled
                    value={businessFormData?.city}
                    label="LGA"
                    placeholder="Enter business city"
                  /> */}

                  <SelectInput
                    label="State"
                    name="state"
                    onChange={handleInputChange}
                    defaultSelectedKeys={[businessFormData?.state]}
                    value={businessFormData?.state}
                    placeholder={'Select state'}
                    contents={getStates()}
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-full">
                  <SelectInput
                    label="City"
                    name="city"
                    onChange={handleInputChange}
                    defaultSelectedKeys={[businessFormData?.city]}
                    value={businessFormData?.city}
                    placeholder={'Select city'}
                    contents={getCities()}
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="w-full flex gap-2">
                  <div className="flex flex-col w-full gap-2">
                    <label
                      className="text-black font-medium text-sm"
                      htmlFor="primaryBrandColor"
                    >
                      Primary Brand Color
                    </label>
                    <input
                      type="color"
                      id="primaryBrandColour"
                      name="primaryBrandColour"
                      className=" w-full h-[46px] border border-[#E0E0E0] rounded-[6px] px-2"
                      onChange={handleInputChange}
                      value={businessFormData?.primaryBrandColour}
                      placeholder="Enter primary brand color"
                    />
                  </div>
                  <div className="flex flex-col w-full gap-2">
                    <label
                      className="text-black font-medium text-sm"
                      htmlFor="primaryBrandColor"
                    >
                      Secondary Brand Color
                    </label>
                    <input
                      type="color"
                      id="secondaryBrandColour"
                      name="secondaryBrandColour"
                      className=" w-full h-[46px] border border-[#E0E0E0] rounded-[6px] px-2"
                      onChange={handleInputChange}
                      value={businessFormData?.secondaryBrandColour}
                      placeholder="Enter secondary brand color"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();
          setIsEditing((prevState) => !prevState);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="grid place-content-center mt-8">
                  <Image
                    src="/assets/images/success.png"
                    width={72}
                    height={72}
                    alt="success"
                  />
                </div>

                <p className="font-semibold text-black text-center mt-4">
                  Business Details Updated Successfully
                </p>
                <ModalFooter>
                  <CustomButton
                    className="h-[48px] px-3 flex-grow text-white"
                    onClick={onClose}
                  >
                    Okay
                  </CustomButton>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BusinessInformation;
