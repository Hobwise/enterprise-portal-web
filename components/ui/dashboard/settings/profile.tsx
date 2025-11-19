"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CustomButton } from "@/components/customButton";
import { BiEditAlt } from "react-icons/bi";
import { CiUser } from "react-icons/ci";
import { Avatar, cn, Divider } from "@nextui-org/react";
import { MdLockOutline } from "react-icons/md";
import { CustomInput } from "@/components/CustomInput";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import {
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  THREEMB,
} from "@/lib/utils";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { RxCross2 } from "react-icons/rx";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import useUser from "@/hooks/cachedEndpoints/useUser";
import SelectInput from "@/components/selectInput";
import { deleteFile, uploadFile } from "@/app/api/controllers/dashboard/menu";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from "@/app/api/controllers/auth";


interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName?: string;
  gender?: string;
  image?: string;
  imageReference?: string;
  isActive?: boolean;
  [key: string]: any;
}

const Profile = () => {
  const queryClient = useQueryClient();

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");

  const { data } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<UserData | null>(null);
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      uploadFile(businessInformation[0]?.businessId, formData),
    onSuccess: (data) => {
      if (data?.data?.isSuccessful) {
        setUserFormData((prevState: any) => ({
          ...prevState,
          imageReference: data?.data.data,
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
        userFormData?.imageReference as string
      ),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        setPreviewUrl(null);
        setUserFormData((prevState: any) => ({
          ...prevState,
          imageReference: "",
          image: null,
        }));
      }
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: () => {
      const changedFields = getChangedFields();
      return updateUser(changedFields, userInformation?.id);
    },
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        onOpen();
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setOriginalUserData(null); // Clear original data after successful update
      }
    },
  });

  React.useEffect(() => {
    if (data) {
      setUserFormData({
        ...data,
        businessID: businessInformation[0]?.businessId,
        cooperateID: userInformation?.cooperateID,
      });
    }
  }, [data]);

  const handleFileChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return toast.error("File too large");
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);

      if (compressedFile) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
      }
      const formData = new FormData();
      formData.append("file", compressedFile);
      uploadFileMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const mapGender = (gender: number) => {
    switch (gender) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      default:
        return "Unknown";
    }
  };

  const getChangedFields = () => {
    if (!userFormData) {
      return {};
    }

    const fieldsWithValues: Partial<UserData> = {};

    // Send all fields that have values (not empty/null/undefined)
    Object.keys(userFormData).forEach((key) => {
      const value = userFormData[key];

      // Include field if it has a value
      // Allow 0 for gender, but exclude empty strings, null, and undefined
      if (value !== null && value !== undefined && value !== '') {
        fieldsWithValues[key] = value;
      }
    });

    // Convert gender to number if it exists
    if ('gender' in fieldsWithValues && fieldsWithValues.gender !== undefined) {
      fieldsWithValues.gender = Number(fieldsWithValues.gender);
    }

    return fieldsWithValues;
  };

  return (
    <div className="space-y-3 sm:space-y-4  lg:space-y-5">
      {!isEditing ? (
        // Card view when not editing
        <div className="py-10 px-6 sm:px-8 lg:px-10 bg-[#5F35D214] rounded-md">
          <div className="flex justify-center items-center">
            <div className="bg-white rounded-[8px] p-8 sm:p-10 lg:p-12 w-full max-w-[420px] shadow-xl">
              <div className="flex flex-col items-center space-y-5">
                {/* Profile Photo */}
                <div className="relative">
                  {userFormData?.image || previewUrl ? (
                    <Avatar
                      size="lg"
                      className="h-[120px] w-[120px]"
                      src={
                        userFormData?.image
                          ? `data:image/jpeg;base64,${userFormData.image}`
                          : previewUrl!
                      }
                    />
                  ) : (
                    <div>
                      <div className="flex items-center justify-center w-[120px] h-[120px] rounded-full bg-[#5F35D20A]">
                        <label
                          htmlFor="profile-photo-edit"
                          className="flex flex-col items-center justify-center space-y-4"
                        >
                          <Image
                            src="/assets/icons/video-audio-icon.svg"
                            width={34}
                            height={34}
                            alt="Video audio icon"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-[#596375]">
                    @{data?.userName || "username not set"}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {data?.firstName && data?.lastName
                      ? `${data.firstName} ${data.lastName}`
                      : "Name not set"}
                  </h3>
                  <p className="text-sm text-[#33363B] font-medium">
                    {data?.isActive ? "Account Manager" : "User"}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="w-full space-y-1 text-center">
                  <p className="text-sm text-gray-500 font-[400]">
                    {data?.email}
                  </p>
                  <p className="text-sm text-gray-500 font-[400]">
                    {data?.phoneNumber || "Phone not set"}
                  </p>
                </div>

                {/* Edit Profile Button */}
                <CustomButton
                  disableRipple
                  className="border-2 border-primaryColor text-primaryColor text-sm px-6 font-bold py-2 h-[36px] mt-2"
                  backgroundColor="bg-white"
                  onClick={() => {
                    setOriginalUserData(userFormData);
                    setIsEditing(true);
                  }}
                >
                  Edit profile
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit mode
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            {userFormData?.image ? (
              <div className="relative">
                <Avatar
                  size="lg"
                  className="h-[120px] w-[120px]"
                  src={`data:image/jpeg;base64,${userFormData.image}`}
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
            ) : !previewUrl ? (
              <div>
                <div className="flex items-center justify-center w-[120px] h-[120px] rounded-full bg-[#5F35D20A]">
                  <label
                    htmlFor="profile-photo-edit"
                    className="flex flex-col items-center justify-center space-y-4 cursor-pointer"
                  >
                    <Image
                      src="/assets/icons/video-audio-icon.svg"
                      width={24}
                      height={24}
                      alt="Video audio icon"
                    />
                    <span className="font-semibold text-[8px] text-primaryColor">
                      Upload Profile Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-photo-edit"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] mt-1 font-semibold text-center text-gray-500">
                  SVG, PNG, JPG or GIF (max. 3mb)
                </p>
              </div>
            ) : (
              <div className="relative">
                <Avatar
                  size="lg"
                  className="h-[120px] w-[120px]"
                  src={previewUrl}
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

            <div className="flex flex-wrap gap-2">
              <CustomButton
                disableRipple
                loading={updateUserMutation.isLoading}
                className="flex  text-xs p-2 h-[30px] text-white"
                onClick={() => updateUserMutation.mutate()}
              >
                <IoCheckmarkCircleOutline className="text-base" />
                Save Changes
              </CustomButton>
              <CustomButton
                disableRipple
                className="flex  border border-danger-500 text-xs p-2 h-[30px] text-danger"
                backgroundColor="bg-transparent"
                onClick={() => {
                  if (originalUserData) {
                    setUserFormData(originalUserData);
                  }
                  setOriginalUserData(null);
                  setIsEditing(false);
                }}
              >
                <RxCross2 className="text-base" />
                Cancel
              </CustomButton>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CiUser className="text-black" />
              <span className="font-medium text-sm">Personal Details</span>
            </div>
            <Divider />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
              <div className="flex flex-col w-full">
                <CustomInput
                  type="text"
                  name="firstName"
                  label="First name"
                  disabled
                  onChange={handleInputChange}
                  value={userFormData?.firstName}
                  placeholder="First name"
                />
              </div>
            </div>
            <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
              <div className="flex flex-col w-full">
                <CustomInput
                  type="text"
                  name="lastName"
                  disabled
                  value={userFormData?.lastName}
                  label="Last name"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
              <div className="flex flex-col w-full">
                <CustomInput
                  type="text"
                  name="email"
                  disabled
                  onChange={handleInputChange}
                  value={userFormData?.email}
                  label="Email"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
              <div className="flex flex-col w-full">
                <CustomInput
                  type="text"
                  name="phoneNumber"
                  onChange={handleInputChange}
                  value={userFormData?.phoneNumber}
                  label="Phone number"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
              <div className="flex flex-col w-full">
                <CustomInput
                  type="text"
                  name="userName"
                  onChange={handleInputChange}
                  value={userFormData?.userName}
                  label="Username"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
              <div className="flex flex-col w-full">
                <SelectInput
                  type="text"
                  name="gender"
                  onChange={handleInputChange}
                  value={userFormData?.gender}
                  defaultSelectedKeys={[String(userFormData?.gender)]}
                  label="Gender"
                  placeholder="Pick a gender"
                  contents={[
                    { label: "Male", value: "0" },
                    { label: "Female", value: "1" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Personal Details Updated Successfully
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

export default Profile;
