"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "react-query";
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
import FileUploadInput from "./file-upload-input";

const PersonalVerificationForm = () => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");

  const userQuery = useUser();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selfieReference, setSelfieReference] = useState("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [idReference, setIdReference] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);

  const [nin, setNin] = useState("");
  const [type, setType] = useState("");
  const [isSelfie, setIsSelfie] = useState<boolean | null>(null);

  useEffect(() => {
    if (userQuery.data) {
      setNin(userQuery.data.identificationNumber || "");
      setSelfieReference(userQuery.data.imageReference || "");
      setSelfiePreviewUrl(
        userQuery.data.image
          ? `data:image/png;base64,${userQuery.data.image}`
          : ""
      );
      setIdReference(userQuery.data.identificationNumberImageReference || "");
      setIdPreviewUrl(
        userQuery.data.identificationNumberImage
          ? `data:image/png;base64,${userQuery.data.identificationNumberImage}`
          : ""
      );
    }
  }, [userQuery.data]);

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      uploadFile(businessInformation[0]?.businessId, formData),
    onSuccess: (data) => {
      if (data?.data?.isSuccessful) {
        if (type === "selfie") {
          setSelfieReference(data?.data.data);
        } else {
          setIdReference(data?.data.data);
        }
      } else {
        if (type === "selfie") {
          setSelfieFile(null);
          setSelfiePreviewUrl(null);
        } else {
          setIdFile(null);
          setIdPreviewUrl(null);
        }
        notify({
          title: "Error!",
          text: data?.data?.error,
          type: "error",
        });
      }
    },
  });

  const removeFileMutation = useMutation({
    mutationFn: (idType: "selfie" | "id") => {
      const imageReference =
        idType === "selfie" ? selfieReference : idReference;
      return deleteFile(
        businessInformation[0]?.businessId,
        imageReference as string
      );
    },
    onSuccess: (data, idType) => {
      if (data?.data.isSuccessful) {
        if (idType === "selfie") {
          setSelfieFile(null);
          setSelfiePreviewUrl(null);
          setSelfieReference("");
        } else {
          setIdFile(null);
          setIdPreviewUrl(null);
          setIdReference(data?.data.data);
        }
      }
    },
  });

  const handleFileChange = async (event: any) => {
    setType(event.target.id);
    if (event.target.files) {
      const file = event.target.files[0];

      // Check file format
      const allowedFormats = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/webp",
      ];
      if (!allowedFormats.includes(file.type)) {
        return toast.error(
          "Invalid file format. Please upload an image (JPG, PNG, GIF, SVG, or WebP)"
        );
      }
      if (file.size > THREEMB) {
        return toast.error("File too large");
      }
      const compressedFile = await imageCompression(file, imageCompressOptions);

      if (event.target.id === "selfie") {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setSelfiePreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
        setSelfieFile(compressedFile);
      } else {
        // Generate a preview URL
        const reader = new FileReader();
        reader.onload = () => setIdPreviewUrl(reader.result as string);
        reader.readAsDataURL(compressedFile);
        setIdFile(compressedFile);
      }
      const formData = new FormData();
      formData.append("file", compressedFile);
      uploadFileMutation.mutate(formData);
    }
  };

  const updateUserMutation = useMutation({
    mutationFn: (payload) => updateUser(payload, userInformation?.id),
    onSuccess: (data) => {
      if (data?.data.isSuccessful) {
        router.replace(`${SETTINGS_URL}/kyc-compliance`);
      }
    },
  });

  const handlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...userQuery.data,
      imageReference: selfieReference ?? "",
      identificationNumberImageReference: idReference ?? "",
      identificationNumber: nin,
    };
    updateUserMutation.mutate(payload);
  };

  if (userQuery.isLoading) return <p>Loading...</p>;

  return (
    <>
      <form className="space-y-3 w-[67.5%]" onSubmit={handlSubmit}>
        <div className="space-y-2">
          <div className="font-medium text-sm text-[#344054]">
            Selfie Upload
          </div>
          <FileUploadInput
            id="selfie"
            label="your SELFIE"
            placeholder="SVG, PNG, JPG or GIF (max. 3mb)"
            onChange={handleFileChange}
          />
          {selfieReference || selfieFile ? (
            <div className="flex items-center gap-3 text-primaryColor text-xs">
              <p
                className="cursor-pointer"
                onClick={() => {
                  setIsSelfie(true);
                  onOpen();
                }}
              >
                {selfieFile?.name || "Click to view uploaded file"}
              </p>
              {removeFileMutation.variables === "selfie" &&
              removeFileMutation.isLoading ? (
                <LuLoader className="animate-spin" />
              ) : (
                <RxCross2 onClick={() => removeFileMutation.mutate("selfie")} />
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="space-y-2">
          <div className="font-medium text-sm text-[#344054]">
            Submit means of identification
          </div>
          <FileUploadInput
            id="id"
            label="a a VALID ID"
            placeholder="SVG, PNG, JPG or GIF (max. 3mb)"
            onChange={handleFileChange}
          />
          {idReference || idFile ? (
            <div className="flex items-center gap-3 text-primaryColor text-xs">
              <p
                className="cursor-pointer"
                onClick={() => {
                  setIsSelfie(false);
                  onOpen();
                }}
              >
                {idFile?.name ?? "Click to view uploaded file"}
              </p>
              {removeFileMutation.variables === "id" &&
              removeFileMutation.isLoading ? (
                <LuLoader className="animate-spin" />
              ) : (
                <RxCross2 onClick={() => removeFileMutation.mutate("id")} />
              )}
            </div>
          ) : (
            <p className="text-[12px] text-gray-600">
              You can submit your National identification card, NIN slip,
              Drivers license, International passport or Voters card
            </p>
          )}
          <div className="flex flex-col space-y-2">
            <label htmlFor="nin" className="font-medium text-sm text-[#344054]">
              National Identification Number ( NIN )
            </label>
            <input
              type="text"
              className="p-4 rounded-xl bg-[#F3F3F3] focus:border focus:border-primaryColor focus:outline-none text-sm"
              placeholder="Enter NIN here"
              value={nin}
              onChange={(e) => setNin(e.target.value)}
            />
          </div>
          <p className="text-[12px] text-gray-600">
            Ensure the name on your NIN matches your name
          </p>
        </div>
        <div className="flex justify-end">
          <CustomButton
            loading={updateUserMutation.isLoading}
            className="w-[200px] h-[50px] text-white font-medium"
          >
            Submit
          </CustomButton>
        </div>
      </form>{" "}
      <Modal isOpen={isOpen} size="sm" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Document Image
              </ModalHeader>
              <ModalBody>
                <Image
                  src={
                    isSelfie ? String(selfiePreviewUrl) : String(idPreviewUrl)
                  }
                  width={500}
                  height={300}
                  alt="Document image"
                />
              </ModalBody>
              <ModalFooter>
                <CustomButton onClick={() => onClose()}>Close</CustomButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PersonalVerificationForm;
