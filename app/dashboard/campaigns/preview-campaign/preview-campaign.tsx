"use client";
import { CustomButton } from "@/components/customButton";
import {
  clearItemLocalStorage,
  formatDateTime,
  formatDateTime2,
  getFromLocalStorage,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";

import { createCampaign } from "@/app/api/controllers/dashboard/campaigns";
import { parseZonedDateTime } from "@internationalized/date";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import noImage from "../../../../public/assets/images/no-image.svg";

const Preview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const getCampaignSavedToDraft = getJsonItemFromLocalStorage(
    "saveCampaignToDraft"
  );
  const selectedImageCampaign = getFromLocalStorage("selectedImageCampaign");
  const getStartDateTime = getFromLocalStorage("saveStartDateTime");
  const getEndDateTime = getFromLocalStorage("saveEndDateTime");
  const businessInformation = getJsonItemFromLocalStorage("business");

  const postCampaign = async () => {
    setIsLoading(true);
    const payload = {
      campaignName: getCampaignSavedToDraft.campaignName,
      campaignDescription: getCampaignSavedToDraft.campaignDescription,
      dressCode: getCampaignSavedToDraft.dressCode,
      isActive: getCampaignSavedToDraft.isActive,
      imageReference: getCampaignSavedToDraft.imageReference,
      startDateTime: formatDateTime(parseZonedDateTime(getStartDateTime)),
      endDateTime: formatDateTime(parseZonedDateTime(getEndDateTime)),
    };
    const data = await createCampaign(
      businessInformation[0]?.businessId,
      payload
    );

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      router.push("/dashboard/campaigns");
      clearItemLocalStorage("saveCampaignToDraft");
      clearItemLocalStorage("selectedImageCampaign");
      clearItemLocalStorage("saveStartDateTime");
      clearItemLocalStorage("saveEndDateTime");

      notify({
        title: "Fantastic!",
        text: "Your campaign has been created",
        type: "success",
      });
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  return (
    <>
      <section className="mt-6 pt-10 flex-grow bg-[#F9F8FF] overflow-scroll rounded-xl flex justify-center items-center">
        <div className="xl:block relative  p-4 overflow-scroll hidden w-[320px] border-[8px]  border-black rounded-[40px] h-full shadow-lg">
          <Image
            className="h-[144px] w-full bg-cover rounded-lg"
            width={120}
            height={144}
            alt="campaign"
            aria-label="campaign"
            src={selectedImageCampaign ? selectedImageCampaign : noImage}
          />

          <h3 className="mt-5 text-black font-bold text-sm">
            {getCampaignSavedToDraft?.campaignName}
          </h3>
          <p className="mt-1 text-[#3D424A] text-sm">
            {" "}
            {getCampaignSavedToDraft?.campaignDescription}
          </p>
          <h3 className="mt-5 text-black font-bold text-sm">FROM</h3>
          <p className="mt-1 text-[#3D424A] text-sm font-[400]">
            {" "}
            {getStartDateTime ? formatDateTime2(getStartDateTime) : ""}
          </p>
          <h3 className="mt-5 text-black font-bold text-sm">To</h3>
          <p className="mt-1 text-[#3D424A] text-sm font-[400]">
            {" "}
            {getEndDateTime ? formatDateTime2(getEndDateTime) : ""}
          </p>
          <h3 className="mt-5 text-black font-bold text-sm">DRESS CODE</h3>
          <p className="mt-1 text-[#3D424A] text-sm font-[400]">
            {" "}
            {getCampaignSavedToDraft?.dressCode}
          </p>
        </div>
      </section>
      <div className="flex justify-end gap-3 mt-5">
        <CustomButton
          className="w-52  h-[50px] text-black bg-transparent border rounded-lg border-grey500"
          onClick={() => {
            router.push("/dashboard/campaigns/create-campaign");
          }}
          type="submit"
        >
          {"Continue editing"}
        </CustomButton>

        <CustomButton
          className="w-58  h-[50px] text-white"
          loading={isLoading}
          onClick={postCampaign}
          type="submit"
        >
          {isLoading ? "Loading" : "Create campaign"}
        </CustomButton>
      </div>
    </>
  );
};

export default Preview;
