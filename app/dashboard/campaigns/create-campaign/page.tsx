"use client";
import {
  createCampaign,
  payloadCampaignItem,
} from "@/app/api/controllers/dashboard/campaigns";
import { deleteFile, uploadFile } from "@/app/api/controllers/dashboard/menu";

import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { CustomTextArea } from "@/components/customTextArea";
import useCampaign from "@/hooks/cachedEndpoints/useCampaign";
import {
  SmallLoader,
  THREEMB,
  clearItemLocalStorage,
  formatDateTime,
  getFromLocalStorage,
  getJsonItemFromLocalStorage,
  imageCompressOptions,
  notify,
  saveJsonItemToLocalStorage,
  saveToLocalStorage,
} from "@/lib/utils";
import {
  getLocalTimeZone,
  now,
  parseZonedDateTime,
  today,
} from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  useDisclosure,
} from "@nextui-org/react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import Success from "../../../../public/assets/images/success.png";

const AddNewCampaign = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const getCampaignSavedToDraft = getJsonItemFromLocalStorage(
    "saveCampaignToDraft"
  );
  const getStartDateTime = getFromLocalStorage("saveStartDateTime") || "";
  const getEndDateTime = getFromLocalStorage("saveEndDateTime") || "";
  const selectedImageSavedToDraft = getFromLocalStorage(
    "selectedImageCampaign"
  );

  const { refetch } = useCampaign();
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [response, setResponse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(
    selectedImageSavedToDraft || ""
  );
  const [startDateTime, setStartDateTime] = useState(
    getStartDateTime
      ? parseZonedDateTime(getStartDateTime)
      : now(getLocalTimeZone())
  );
  const [endDateTime, setEndDateTime] = useState(
    getEndDateTime
      ? parseZonedDateTime(getEndDateTime)
      : now(getLocalTimeZone())
  );

  const [campaignPayload, setCampaignPayload] = useState<payloadCampaignItem>({
    campaignName: getCampaignSavedToDraft?.campaignName || "",
    campaignDescription: getCampaignSavedToDraft?.campaignDescription || "",

    dressCode: getCampaignSavedToDraft?.dressCode || "",
    isActive: getCampaignSavedToDraft?.isActive || true,
    imageReference: getCampaignSavedToDraft?.imageReference || "",
  });

  const formSubmit = () => {
    return (
      campaignPayload.campaignName &&
      campaignPayload.campaignDescription &&
      campaignPayload.dressCode &&
      startDateTime &&
      endDateTime
    );
  };

  const businessInformation = getJsonItemFromLocalStorage("business");

  const menuFileUpload = async (formData: FormData, file: any) => {
    setIsLoadingImage(true);
    const data = await uploadFile(businessInformation[0]?.businessId, formData);
    setIsLoadingImage(false);
    setImageError("");
    if (data?.data?.isSuccessful) {
      setSelectedImage(URL.createObjectURL(file));
      setCampaignPayload({
        ...campaignPayload,
        imageReference: data.data.data,
      });
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };
  const removeUploadedFile = async () => {
    const data = await deleteFile(
      businessInformation[0]?.businessId,
      campaignPayload.imageReference
    );

    if (data?.data?.isSuccessful) {
      setSelectedImage("");
      clearItemLocalStorage("selectedImageCampaign");
      toast.success("Image removed");
    } else if (data?.data?.error) {
      setImageError(data?.data?.error);
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const handleImageChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return setImageError("File too large");
      }

      const compressedFile = await imageCompression(file, imageCompressOptions);
      const formData = new FormData();
      formData.append("file", compressedFile);
      menuFileUpload(formData, file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setCampaignPayload((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const postCampaign = async () => {
    setIsLoading(true);
    const payload = {
      campaignName: campaignPayload.campaignName,
      campaignDescription: campaignPayload.campaignDescription,
      dressCode: campaignPayload.dressCode,
      isActive: campaignPayload.isActive,
      imageReference: campaignPayload.imageReference,
      startDateTime: formatDateTime(startDateTime),
      endDateTime: formatDateTime(endDateTime),
    };
    const data = await createCampaign(
      businessInformation[0]?.businessId,
      payload
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      onOpen();
      clearItemLocalStorage("saveCampaignToDraft");
      clearItemLocalStorage("selectedImageCampaign");
      clearItemLocalStorage("saveStartDateTime");
      clearItemLocalStorage("saveEndDateTime");
      setStartDateTime(now(getLocalTimeZone()));
      setEndDateTime(now(getLocalTimeZone()));
      setCampaignPayload({
        campaignName: "",
        campaignDescription: "",
        dressCode: "",
        isActive: true,
        imageReference: "",
      });

      setSelectedImage("");
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const saveToDraft = () => {
    saveJsonItemToLocalStorage("saveCampaignToDraft", campaignPayload);
    saveToLocalStorage("selectedImageCampaign", selectedImage);
    saveToLocalStorage("saveStartDateTime", startDateTime);
    saveToLocalStorage("saveEndDateTime", endDateTime);
  };

  useEffect(() => {
    setCampaignPayload({
      campaignName: getCampaignSavedToDraft?.campaignName || "",
      campaignDescription: getCampaignSavedToDraft?.campaignDescription || "",
      dressCode: getCampaignSavedToDraft?.dressCode || "",
      isActive: getCampaignSavedToDraft?.isActive || true,
      imageReference: getCampaignSavedToDraft?.imageReference || "",
    });
    setStartDateTime(
      getStartDateTime
        ? parseZonedDateTime(getStartDateTime)
        : now(getLocalTimeZone())
    );
    setEndDateTime(
      getEndDateTime
        ? parseZonedDateTime(getEndDateTime)
        : now(getLocalTimeZone())
    );
    setSelectedImage(selectedImageSavedToDraft || "");
  }, []);

  return (
    <>
      <div className="flex  justify-between">
        <div>
          <h1 className="text-[24px] leading-8 font-semibold">
            {" "}
            Create a new campaign
          </h1>
          <p className="text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4">
            Setup a new campaign.
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          className=" text-grey600 bg-white"
        >
          <IoIosArrowRoundBack className="text-[22px]" />
          <p>Go back</p>
        </Button>
      </div>
      <div className="flex lg:flex-row flex-col">
        <div className="flex-grow lg:w-1/2 w-full lg:p-6 p-0 xl:border border-[#F5F5F5] rounded-tl-lg rounded-bl-lg">
          <CustomInput
            type="text"
            value={campaignPayload.campaignName}
            errorMessage={response?.errors?.campaignName?.[0]}
            onChange={handleInputChange}
            name="campaignName"
            label="Title of campaign"
            placeholder="Title of campaign"
          />
          <Spacer y={6} />
          <CustomTextArea
            maxLength={200}
            value={campaignPayload.campaignDescription}
            name="campaignDescription"
            errorMessage={response?.errors?.campaignDescription?.[0]}
            onChange={handleInputChange}
            label="Add a description for this campaign"
            placeholder="Add a description"
          />
          <Spacer y={6} />
          <div>
            <label className="font-[500] text-black text-[14px] pb-1">
              Campaign start
            </label>
            <DatePicker
              variant="bordered"
              calendarWidth={270}
              hideTimeZone
              size="lg"
              radius="sm"
              errorMessage={response?.errors?.startDateTime?.[0]}
              value={startDateTime}
              onChange={setStartDateTime}
              showMonthAndYearPickers
              minValue={today(getLocalTimeZone())}
              defaultValue={now(getLocalTimeZone())}
            />
          </div>
          <Spacer y={6} />
          <div>
            <label className="font-[500] text-black text-[14px] pb-1">
              Campaign end
            </label>
            <DatePicker
              variant="bordered"
              calendarWidth={270}
              hideTimeZone
              size="lg"
              radius="sm"
              errorMessage={response?.errors?.endDateTime?.[0]}
              value={endDateTime}
              onChange={setEndDateTime}
              showMonthAndYearPickers
              minValue={startDateTime}
              defaultValue={startDateTime}
            />
          </div>
          <Spacer y={6} />
          <CustomInput
            type="text"
            name="dressCode"
            onChange={handleInputChange}
            value={`${campaignPayload.dressCode}`}
            label={"Dress code"}
            placeholder={"Dress code"}
          />
        </div>
        <div
          className={`flex-grow xl:h-auto lg:w-1/2 full  p-0  xl:mt-0 mt-4 xl:border border-[#F5F5F5]  rounded-tr-lg rounded-br-lg`}
        >
          <label className="flex xl:mx-4 xl:my-2 m-0 justify-between  bg-white">
            <div>
              <p className="font-[500] text-[14px]">Image</p>
              <p className=" text-grey400 text-[12px]">
                Add an image to this campaign
              </p>
            </div>
            <p className="text-[#475467] text-[14px] font-[400]">
              Maximum of 3MB
            </p>
          </label>
          <div
            className={`lg:h-[calc(100%-5rem)] bg-[#F9F8FF] h-[200px] border  xl:m-4 mt-2 rounded-md ${
              imageError ? "border-danger-600" : "border-[#F5F5F5]"
            }   text-sm font-[400] text-center relative`}
          >
            {selectedImage ? (
              <>
                <Image
                  src={selectedImage}
                  width={200}
                  height={200}
                  className="object-cover h-full rounded-md w-full"
                  aria-label="uploaded image"
                  alt="uploaded image(s)"
                />
                <span
                  onClick={removeUploadedFile}
                  className="text-danger-500 float-left cursor-pointer"
                >
                  Remove
                </span>
              </>
            ) : (
              <>
                <div className="flex flex-col h-full justify-center items-center">
                  <div className="flex flex-col mt-0 text-black text-center xl:w-[240px]  w-full gap-2 justify-center items-center">
                    {isLoadingImage ? (
                      <SmallLoader />
                    ) : (
                      <>
                        <MdOutlineAddPhotoAlternate className="text-[42px] text-primaryColor" />
                        <span className="text-black">
                          Drag and drop files to upload or{" "}
                          <span className="text-primaryColor">click here</span>{" "}
                          to browse
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    title="upload an image"
                    alt="upload a campaign"
                    type="file"
                    id="campaign-upload"
                    accept="image/*"
                    onChange={(event) => handleImageChange(event)}
                    className="h-full w-full opacity-0 cursor-pointer absolute top-0"
                  />
                </div>
              </>
            )}

            <span className="text-sm float-left text-danger-600">
              {imageError}
            </span>
          </div>
        </div>
      </div>
      <Spacer y={1} />
      <div className="flex justify-end gap-3">
        {formSubmit() && (
          <CustomButton
            className="w-52 h-[50px] text-black bg-transparent border rounded-lg border-grey500"
            onClick={() => {
              router.push("/dashboard/campaigns/preview-campaign");
              saveToDraft();
            }}
            type="submit"
          >
            {"Preview campaign"}
          </CustomButton>
        )}
        <CustomButton
          className="w-58 h-[50px] text-white"
          loading={isLoading}
          onClick={postCampaign}
          type="submit"
        >
          {isLoading ? "Loading" : "Create campaign"}
        </CustomButton>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="grid place-content-center mt-8">
                  <Image src={Success} alt="success" />
                </div>

                <h2 className="text-[16px] text-center leading-3 mt-3 text-black font-semibold">
                  Fantastic!
                </h2>
                <h3 className="text-sm text-center text-grey600     mb-4">
                  Your campaign has been created
                </h3>

                <div className="flex gap-3">
                  <CustomButton
                    onClick={async () => {
                      await refetch();
                      router.push("/dashboard/campaigns");
                    }}
                    className="h-[49px] md:mb-0 w-full flex-grow text-black border border-[#D0D5DD] mb-4 "
                    backgroundColor="bg-white"
                    type="submit"
                  >
                    View campaigns
                  </CustomButton>
                  <CustomButton
                    className="text-white h-[49px]  flex-grow w-full"
                    onClick={onClose}
                    type="submit"
                  >
                    Add another campaign
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

export default AddNewCampaign;
