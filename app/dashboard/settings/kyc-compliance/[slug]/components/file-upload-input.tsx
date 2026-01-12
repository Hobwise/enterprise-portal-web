"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import { options } from "@/app/dashboard/settings/kyc-compliance/verification-types";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useMutation } from '@tanstack/react-query';
import {
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
  THREEMB,
} from "@/lib/utils";
import { deleteFile, uploadFile } from "@/app/api/controllers/dashboard/menu";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { updateUser } from "@/app/api/controllers/auth";
import { CustomButton } from "@/components/customButton";
import useUser from "@/hooks/cachedEndpoints/useUser";
import { SETTINGS_URL } from "@/utilities/routes";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import api from "@/app/api/apiService";
import { AUTH } from "@/app/api/api-url";
import { RxCross2 } from "react-icons/rx";
import { LuLoader } from "react-icons/lu";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import Image from "next/image";

const FileUploadInput = ({
  id,
  label,
  placeholder,
  onChange,
  accept,
}: {
  id: string;
  label: string;
  placeholder: string;
  accept?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label
    htmlFor={id}
    className="flex flex-col items-center cursor-pointer justify-center border border-dashed border-secondaryGrey rounded-[10px] py-6 text-[12px] space-y-2"
  >
    <div className="flex items-center justify-center rounded-full w-6 h-6 bg-[#F9FAFB]">
      <IoCloudUploadOutline />
    </div>
    <div className="text-center">
      <p className="text-[#475367]">
        <span className="font-semibold text-primaryColor">Click to upload</span>{" "}
        {label}
      </p>
      <p className="text-[#98A2B3]">{placeholder}</p>
    </div>
    <input
      accept={accept}
      type="file"
      id={id}
      className="hidden"
      onChange={onChange}
    />
  </label>
);

export default FileUploadInput;
