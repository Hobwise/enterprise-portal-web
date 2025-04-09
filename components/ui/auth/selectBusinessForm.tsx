"use client";
import {
  getBusinessDetails,
  loginUserSelectedBusiness,
} from "@/app/api/controllers/auth";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import { useGlobalContext } from "@/hooks/globalProvider";
import { setJsonCookie } from "@/lib/cookies";
import { decryptPayload } from "@/lib/encrypt-decrypt";
import {
  SmallLoader,
  notify,
  saveJsonItemToLocalStorage,
  setTokenCookie,
} from "@/lib/utils";
import { Avatar, ScrollShadow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SelectBusinessForm = () => {
  const router = useRouter();
  const { loginDetails } = useGlobalContext();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: loading } = useGetBusinessByCooperate();

  const callLogin = async (businessId: string) => {
    const data = await loginUserSelectedBusiness(loginDetails, businessId);
    if (data?.data?.response) {
      const decryptedData = decryptPayload(data.data.response);
      if (decryptedData?.data) {
        saveJsonItemToLocalStorage("userInformation", decryptedData?.data);
        setTokenCookie("token", decryptedData?.data.token);
        router.push("/dashboard");
      }
    }
  };

  const handleSelectedBusiness = async (item: any) => {
    setIsLoading(true);

    setBusiness(item);
    const data = await getBusinessDetails(item);

    if (data?.data?.isSuccessful) {
      saveJsonItemToLocalStorage("business", [data?.data?.data]);
      await callLogin(data?.data?.data.businessId);

      setIsLoading(false);
    } else if (data?.data?.error) {
      setIsLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="grid place-content-center">
        <SmallLoader />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 w-full`}>
      {data?.map((item: any) => {
        return (
          <ScrollShadow
            key={item.id}
            size={10}
            className="w-full max-h-[350px]"
          >
            <article
              className={`bg-[#F1F2F480] rounded-xl p-3 cursor-pointer ${
                isLoading &&
                item.name === business?.name &&
                "border-grey500 border"
              }`}
              onClick={() => handleSelectedBusiness(item)}
              key={item.name}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    showFallback={true}
                    size="lg"
                    src={`data:image/jpeg;base64,${item?.logoImage}`}
                    name={item?.name}
                  />
                  <div className="flex flex-col">
                    <span className="font-[600] text-[14px]">{item?.name}</span>

                    <span className="text-[12px] font-[400]">
                      {item?.city}
                      {item?.city && ","} {item?.state}
                    </span>
                  </div>
                </div>
                {isLoading && item.name === business?.name && <SmallLoader />}
              </div>
            </article>
          </ScrollShadow>
        );
      })}
    </div>
  );
};

export default SelectBusinessForm;
