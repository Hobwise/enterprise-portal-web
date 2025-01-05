"use client";
import useGetBusiness from "@/hooks/cachedEndpoints/useGetBusiness";
import { saveToLocalStorage } from "@/lib/utils";
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CiWarning } from "react-icons/ci";
import { CustomButton } from "./customButton";

const BusinessSettingsDashboardPrompt = () => {
  const { data } = useGetBusiness();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  useEffect(() => {
    if (data?.businessContactNumber === "") {
      onOpen();
    }
  }, [data]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="text-black md:p-10 p-8 space-y-4">
              <div className="w-full grid place-content-center">
                <div className="bg-[#ffebca] h-[60px] grid place-content-center rounded-full  w-[60px]">
                  <CiWarning className="text-[#F4B23E] font-3xl text-[35px]" />
                </div>
              </div>
              <div>
                <p className="font-bold text text-[20px] mb-2 text-center">
                  Complete your business profile
                </p>
                <div className="flex justify-center items-center">
                  <p className="text-sm text-grey500 text-center md:w-[90%] w-[100%]">
                    Please complete your business profile to fully access all
                    features and functionalities of the application.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <CustomButton
                  className="h-[50px]  text-white"
                  onClick={() => {
                    onOpenChange();
                    saveToLocalStorage("businessSettingPrompt", true);
                    router.push("/dashboard/settings/personal-information");
                  }}
                  type="submit"
                >
                  Go to settings
                </CustomButton>
                <CustomButton
                  className="h-[50px]  text-black bg-transparent border rounded-lg border-primaryGrey"
                  onClick={onOpenChange}
                  type="submit"
                >
                  Skip Now
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BusinessSettingsDashboardPrompt;
