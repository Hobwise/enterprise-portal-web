'use client';

import { CustomButton } from '@/components/customButton';
import TermsCondition from '@/components/ui/dashboard/settings/business-settings/terms&condition';
import useGetBusiness from '@/hooks/cachedEndpoints/useGetBusiness';
import { useGlobalContext } from '@/hooks/globalProvider';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Divider } from '@nextui-org/react';
import { useCallback, useState } from 'react';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { TbCopy } from 'react-icons/tb';
import { Tab, Tabs } from '@nextui-org/react';

const BusinessSettings = () => {
  const { data } = useGetBusiness();
  const { setBusinessProfileNavigate } = useGlobalContext();

  const userInformation = getJsonItemFromLocalStorage('userInformation') || [];

  const Details = ({ text1, text2 }: { text1: string; text2: any }) => {
    const [changeIcon, setChangeIcon] = useState(false);
    const copyToClipboard = useCallback(async () => {
      await navigator.clipboard.writeText(text2);
      setChangeIcon(true);
      setTimeout(() => {
        setChangeIcon(false);
      }, 2000);
    }, [text2]);
    return (
      <div className="flex justify-between text-black gap-3 items-center py-4">
        <div>
          <p className="text-xs font-[400] text-grey500">{text1}</p>
          <p className="text-sm font-[500]">{text2}</p>
        </div>
        <div>
          {changeIcon ? (
            <IoCheckmarkOutline className="text-[20px] cursor-pointer text-grey400" />
          ) : (
            <TbCopy
              onClick={copyToClipboard}
              className="text-[20px] cursor-pointer text-grey400"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">
            Business settings
          </h1>
          <p className="text-sm  text-grey600 md:mb-10 mb-4">
            Manage your business settings
          </p>
        </div>
        {/* {userInformation.role === 0 && (
          <CustomButton
            onClick={() => {
              setBusinessProfileNavigate(0);
            }}
            className="py-2 px-4 md:mb-0 mb-4 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-1 items-center justify-center">
              <span>
                <TbEdit className="text-[18px]" />
              </span>
              <span> Update</span>
            </div>
          </CustomButton>
        )} */}
      </div>

      <article className="bg-white border border-[#F0F2F5] rounded-lg px-3 md:px-6 py-2 mb-6">
        <Details
          text1="Primary brand colour"
          text2={data?.primaryBrandColour}
        />
        <Divider className="bg-[#F0F2F5]" />
        <Details
          text1="Secondary brand colour"
          text2={data?.secondaryBrandColour}
        />
      </article>
      {userInformation.role === 0 && (
        <article className="bg-white border border-[#F0F2F5] rounded-lg px-3 md:px-6 py-2 mb-6">
          <div className="flex justify-between text-black items-center py-4">
            <div>
              <p className="font-[600] ">Service Terms and Conditions</p>
              <p className="text-sm font-[400] text-grey500">
                Your terms and conditions for your services
              </p>
            </div>

            <div>
              <CustomButton
                onClick={() => {
                  setBusinessProfileNavigate(2);
                }}
                className=" text-black bg-transparent border rounded-lg border-grey500"
              >
                View
              </CustomButton>
            </div>
          </div>
        </article>
      )}
      {userInformation.role === 0 && (
        <article className="bg-white border border-[#F0F2F5] rounded-lg px-3 md:px-6 py-2 mb-6">
          <div className="flex justify-between text-black items-center py-4">
            <div>
              <p className="font-[600] ">Email Templates</p>
              <p className="text-sm font-[400] text-grey500">
                Customize emails that your customers receive
              </p>
            </div>

            <div>
              <CustomButton
                onClick={() => {
                  setBusinessProfileNavigate(1);
                }}
                className=" text-black bg-transparent border rounded-lg border-grey500"
              >
                View
              </CustomButton>
            </div>
          </div>
        </article>
      )}
    </section>
  );
};

const BusinessSettingsPage = () => {
  const { businessProfileNavigate } = useGlobalContext();

  let tabs = [
    {
      id: 'Update business',
      label: 'Update business',

      content: <BusinessSettings />,
    },

    {
      id: 'Terms and condition',
      label: 'Terms and condition',

      content: <TermsCondition />,
    },
  ];
  return (
    <div className="flex w-full flex-col">
      <Tabs
        size="lg"
        fullWidth={true}
        defaultSelectedKey={tabs[businessProfileNavigate].id}
        className="w-full mb-2"
        aria-label="Business settings tab"
        items={tabs}
      >
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessSettingsPage;
