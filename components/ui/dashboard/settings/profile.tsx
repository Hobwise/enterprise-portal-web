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
import { useMutation, useQueryClient } from "react-query";
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
        }));
      }
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: () =>
      updateUser(
        { ...userFormData, gender: Number(userFormData?.gender) },
        userInformation?.id
      ),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        onOpen();
        queryClient.invalidateQueries({ queryKey: ["user"] });
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
        // Generate a preview URL
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-[#101928]">Personal information</h2>
        <p className="text-sm text-[#667185]">
          See your full personal information
        </p>
      </div>
      <div className="border border-secondaryGrey rounded-[10px] p-4 space-y-8">
        <div className="flex items-center justify-between w-full">
          {userFormData?.image ? (
            <Avatar
              size="lg"
              className="h-[120px] w-[120px]"
              src={`data:image/jpeg;base64,${userFormData.image}`}
            />
          ) : !previewUrl ? (
            <div className="flex items-center justify-center w-[120px] h-[120px] rounded-full bg-[#5F35D20A]">
              <label
                htmlFor="profile-photo"
                className="flex flex-col items-center justify-center space-y-4"
              >
                <Image
                  src="/assets/icons/video-audio-icon.svg"
                  width={24}
                  height={24}
                  alt="Video audio icon"
                />
                <span className="font-semibold text-[8px] text-primaryColor">
                  No Profile Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  id="profile-photo"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
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

          {/* {!previewUrl ? (
            <div className="flex items-center justify-center w-[120px] h-[120px] rounded-full bg-[#5F35D20A]">
              <label
                htmlFor="profile-photo"
                className="flex flex-col items-center justify-center space-y-4"
              >
                <Image
                  src="/assets/icons/video-audio-icon.svg"
                  width={24}
                  height={24}
                  alt="Video audio icon"
                />
                <span className="font-semibold text-[8px] text-primaryColor">
                  No Profile Photo
                </span>
                <input
                  type="file"
                  id="profile-photo"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
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
          )} */}

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
                loading={updateUserMutation.isLoading}
                className="flex  rounded-[10px] text-xs p-2 h-[30px] text-white"
                onClick={() => updateUserMutation.mutate()}
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
            <CiUser className="text-black" />
            <span className="font-medium text-sm">Personal Details</span>
          </div>
          <Divider />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 ">
          {!isEditing ? (
            <>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <MdLockOutline className="mt-1" />
                <div className="flex flex-col">
                  <span className="text-sm">First Name</span>
                  <span
                    className={cn(
                      "text-sm",
                      data?.firstName.length > 0 ? "text-black" : "text-red-500"
                    )}
                  >
                    {data?.firstName.length > 0
                      ? data?.firstName
                      : "Not updated"}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <MdLockOutline className="mt-1" />
                <div className="flex flex-col">
                  <span className="text-sm">Last Name</span>
                  <span
                    className={cn(
                      "text-sm",
                      data?.lastName.length > 0 ? "text-black" : "text-red-500"
                    )}
                  >
                    {data?.lastName.length > 0 ? data?.lastName : "Not updated"}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <MdLockOutline className="mt-1" />
                <div className="flex flex-col">
                  <span className="text-sm">Email</span>
                  <span
                    className={cn(
                      "text-sm",
                      data?.email.length > 0 ? "text-black" : "text-red-500"
                    )}
                  >
                    {data?.email.length > 0 ? data?.email : "Not updated"}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Phone No</span>
                  <span
                    className={cn(
                      "text-sm",
                      data?.phoneNumber?.length > 0
                        ? "text-black"
                        : "text-red-500"
                    )}
                  >
                    {data?.phoneNumber?.length > 0
                      ? data?.phoneNumber
                      : "Not updated"}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Username</span>
                  <span
                    className={cn(
                      "text-sm",
                      data?.userName?.length > 0 ? "text-black" : "text-red-500"
                    )}
                  >
                    {data?.userName?.length > 0
                      ? data?.userName
                      : "Not updated"}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="h-4 w-4"></div>
                <div className="flex flex-col">
                  <span className="text-sm">Gender</span>
                  <span
                    className={cn(
                      "text-sm",
                      !Number.isNaN(data?.gender)
                        ? "text-black"
                        : "text-red-500"
                    )}
                  >
                    {!Number.isNaN(data?.gender)
                      ? mapGender(data?.gender)
                      : "Not updated"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-4/5">
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
                <div className="flex flex-col w-4/5">
                  <CustomInput
                    type="text"
                    name="lastName"
                    disabled
                    // errorMessage={response?.errors?.lastName?.[0]}
                    // onChange={handleInputChange}
                    value={userFormData?.lastName}
                    label="Last name"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-4/5">
                  <CustomInput
                    type="text"
                    name="email"
                    disabled
                    // errorMessage={response?.errors?.email?.[0]}
                    onChange={handleInputChange}
                    value={userFormData?.email}
                    label="Email"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-4/5">
                  <CustomInput
                    type="text"
                    name="phoneNumber"
                    // errorMessage={response?.errors?.lastName?.[0]}
                    onChange={handleInputChange}
                    value={userFormData?.phoneNumber}
                    label="Phone number"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-4/5">
                  <CustomInput
                    type="text"
                    name="userName"
                    // errorMessage={response?.errors?.lastName?.[0]}
                    onChange={handleInputChange}
                    value={userFormData?.userName}
                    label="Username"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="col-span-1 flex gap-2 text-[#AFAFAF]">
                <div className="flex flex-col w-4/5">
                  <SelectInput
                    type="text"
                    name="gender"
                    // errorMessage={response?.errors?.role?.[0]}
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
