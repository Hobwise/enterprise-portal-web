import React, { useEffect, useState } from 'react';
import mastercardLogo from '../../../../../public/assets/images/mastercard-logo.svg';
import Image from 'next/image';
import visa from '../../../../../public/assets/images/visa.png';
import verve from '../../../../../public/assets/images/verve.png';
import { PaidCardsData } from './Interfaces';
import { Divider, Spinner } from '@nextui-org/react';

import {
  capitalizeFirstLetterOfEachWord,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
// import useManageSubscription from "@/hooks/cachedEndpoints/useManageSubscription";
import {
  manageSubscription,
  manageSubscriptionv2,
} from '@/app/api/controllers/dashboard/settings';
import IframeComponent from './Iframe';
import LoadingSpinner from '@/app/dashboard/menu/[menuId]/loading';

export const PaidCards: React.FC<PaidCardsData> = ({
  cardDetails,
  currentSubscriptionDetails,
}) => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessID = userInformation?.businesses[0]?.businessId;

  const [manageSubUrl, setManageSubUrl] = useState<string>('');
  const [triggerIframe, setTriggerIframe] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  // const { bindings,  } = useModal();

  //* HANDLE TYPES
  const TYPE_OF_CARD = {
    VISA: <Image alt="Visa" src={visa} height={32} layout="intrinsic" />,
    VERVE: <Image alt="Verve" src={verve} height={32} layout="intrinsic" />,
    MASTERCARD: (
      <Image
        alt="Mastercard"
        src={mastercardLogo}
        height={32}
        layout="intrinsic"
      />
    ),
  };

  const TYPE_OF_PLAN = {
    1: 'Premium',
    2: 'Professional',
    3: 'Starter',
  };

  //* SET VALUES
  let image;
  let plan;

  const cardBrand = cardDetails?.brand?.toUpperCase();
  const planType = currentSubscriptionDetails?.plan;

  image =
    cardBrand === 'VISA'
      ? TYPE_OF_CARD.VISA
      : cardBrand === 'VERVE'
      ? TYPE_OF_CARD.VERVE
      : TYPE_OF_CARD.MASTERCARD;

  plan =
    planType === 1
      ? TYPE_OF_PLAN[1]
      : planType === 2
      ? TYPE_OF_PLAN[2]
      : TYPE_OF_PLAN[3];

  const nextPayment =
    currentSubscriptionDetails?.nextPaymentDate?.split('T')[0];
  const isActive = currentSubscriptionDetails?.isActive ? 'Active' : 'False';

  const paystackStatus = cardDetails?.status;

  //*================== MANAGE SUBSCRIPTION ==================

  const manageYourSubscription = async () => {
    setLoadingModal(true);
    const token = getJsonItemFromLocalStorage('userInformation').token;
    const data = await manageSubscriptionv2(businessID, token);
    if (data !== null && data.error == null) {
      setManageSubUrl(data?.data);

      triggerModal();
    }
  };

  const triggerModal = () => {
    setTriggerIframe(true);
  };

  useEffect(() => {
    // console.log("TRIGGER STATUS", triggerIframe);
    if (!triggerIframe) {
      setLoadingModal(false);
    }
  }, [triggerIframe]);

  //*================== MANAGE SUBSCRIPTION ==================
  return (
    <div>
      <div className="flex flex-col gap-0 lg:flex-row md:flex-row sm:gap-4 mb-5">
        <div className="flex flex-col justify-center w-full h-[157px] border border-secondaryGrey py-6 px-4 rounded-lg">
          {image}
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#344054] text-sm">
              {capitalizeFirstLetterOfEachWord(cardDetails?.brand!)} ending in{' '}
              {cardDetails?.last4}
            </p>
            <div className="border border-[#04326B] py-[2px] px-3 rounded-xl text-[#04326B] text-sm font-medium">
              Default
            </div>
          </div>
          <p className="font-medium text-sm text-[#344054]">
            Expiry {cardDetails?.exp_Month}/{cardDetails?.exp_Year}
          </p>
        </div>
        <div className="flex flex-col justify-center w-full border border-secondaryGrey py-4 px-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{plan} plan</p>
              <p className="text-sm text-[#344054] font-medium">
                Next payment date{' '}
                <span className="font-normal">{nextPayment}</span>
              </p>
            </div>
            <div className="flex flex-col">
              <div className="border border-[#04326B] py-[2px] px-3 rounded-xl text-[#04326B] text-sm font-medium">
                {isActive}
              </div>
              <span className='text-center text-sm text-secondaryGrey'>{paystackStatus}</span>
            </div>
          </div>
          <Divider className="my-4" />
          <div className="flex justify-center">
            <button
              onClick={() => manageYourSubscription()}
              className="font-semibold text-sm text-primaryColor"
            >
              Manage subscriptions
            </button>
          </div>
        </div>
      </div>
      {triggerIframe && (
        <IframeComponent
          url={manageSubUrl}
          trigger={triggerIframe}
          setTriggerIframe={setTriggerIframe}
        />
      )}{' '}
    </div>
  );
};
