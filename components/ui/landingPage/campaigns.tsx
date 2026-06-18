'use client';
import Image, { StaticImageData } from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { CampaignIcon } from '@/public/assets/svg';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import React, { useEffect, useState } from 'react';
import { getCampaigns } from '@/app/api/controllers/landingPage';
import { formatDate, getInitials2 } from '@/lib/utils';
import { Skeleton } from './skeleton-loading';
import CarouselLoading from '@/public/assets/images/loading-carousel.png';
import DateWrapper from '@/public/assets/images/date-wrapper.png';
import CampaignBurger from '@/public/assets/images/campaign-burger.png';
import CampaignDate from '@/public/assets/images/campaign-date.png';
import { CalendarIcon, FromText, LocationIcon } from '@/public/assets/svg';

interface ICampaign {
  businessLogo: string;
  campaignDescription: string;
  campaignName: string;
  dressCode: string;
  endDateTime: string;
  startDateTime: string;
  businessName: string;
  image: string;
  businessAddress: string;
  staticImage?: StaticImageData;
  staticDateImage?: StaticImageData;
}

const DEFAULT_CAMPAIGNS: ICampaign[] = [
  {
    businessName: "Betty's",
    campaignName: 'Special Burger',
    campaignDescription: 'Sample description of the campaign lorem ipsum dolor sa get on while you can',
    businessAddress: '',
    startDateTime: '2024-11-14',
    endDateTime: '2024-11-20',
    image: '',
    businessLogo: '',
    dressCode: '',
    staticImage: CampaignBurger,
    staticDateImage: CampaignDate,
  },
];

export default function Campaigns() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1 rounded-full text-xs lg:mx-auto shadow_custom-inset';

  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  const getAllCampaigns = async (loading = true) => {
    setIsLoading(loading);
    const data = await getCampaigns();
    setIsLoading(false);

    if (data?.data?.isSuccessful && data?.data?.data?.length) {
      setCampaigns(data.data.data);
    } else {
      setCampaigns(DEFAULT_CAMPAIGNS);
    }
  };

  useEffect(() => {
    getAllCampaigns();
  }, []);

  if (isLoading) return <Skeleton className="w-full h-[350px]" />;

  if (campaigns.length === 0) return null;

  return (
    <section className="bg-white py-8 lg:py-16 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12">
      <div className={sectionHeaderClass}>
        <CampaignIcon />
        <p className="font-normal">Campaigns</p>
      </div>
      <div className="w-full">
        <h2 className="text-[28px] text-left lg:text-center lg:text-[44px] text-[#1D2939] lg:leading-[52px] font-bricolage_grotesque font-bold">
          Checkout amazing deals from brands registered with us
        </h2>
      </div>
      <div className="w-full relative px-4 lg:px-8">
        <Carousel
          className="w-full"
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            {campaigns.map((campaign) => (
              <React.Fragment key={campaign.campaignName}>
                <CarouselItem className=" w-full">
                  <div className="w-full relative h-auto lg:h-[350px] bg-[#FBEAD7] flex flex-col lg:flex-row px-4 sm:px-6 lg:px-10 lg:space-x-10 items-center rounded-2xl py-6 lg:py-0">
                    <div className="w-[60%] lg:w-[25%] mb-4 lg:mb-0">
                      {campaign.staticImage ? (
                        <Image src={campaign.staticImage} alt="campaign" className="object-contain mx-auto rounded-2xl lg:h-[300px] w-auto" />
                      ) : campaign.image ? (
                        <img src={`data:image/png;base64,${campaign.image}`} alt="product image" className="object-contain mx-auto lg:h-[300px]" />
                      ) : (
                        <div className="w-full lg:h-[300px] rounded-lg bg-[#DDDCFE] text-primaryColor font-medium text-[24px] lg:text-[80px] font-bricolage_grotesque flex items-center justify-center">
                          <p>{getInitials2(campaign?.businessName)}</p>
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-[75%] flex flex-col lg:flex-row items-center lg:space-x-6">
                      <div className="text-center lg:text-left w-full lg:w-[65%]">
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                          {campaign.businessLogo ? (
                            <img src={`data:image/png;base64,${campaign.businessLogo}`} alt={campaign.businessName} className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-[#7A3B12] text-white text-[11px] flex items-center justify-center font-bold font-bricolage_grotesque">
                              {getInitials2(campaign.businessName)}
                            </div>
                          )}
                          <p className="font-medium font-satoshi text-[14px] sm:text-[16px] lg:text-[20px] text-[#222222] truncate">{campaign.businessName}</p>
                        </div>
                        <p className="font-bricolage_grotesque font-bold text-[20px] sm:text-[24px] lg:text-[40px] text-[#171D22]">{campaign.campaignName}</p>
                        <p className="font-satoshi text-[12px] sm:text-[14px] lg:text-[18px] text-[#55626A] multi-truncate">
                          {campaign.campaignDescription}
                        </p>
                        {campaign.businessAddress ? (
                          <div className="flex space-x-2 items-center mt-2 justify-center lg:justify-start">
                            <LocationIcon />
                            <p className="text-xs font-light truncate text-[#55626A]">{campaign.businessAddress}</p>
                          </div>
                        ) : null}
                        <img src={CarouselLoading.src} alt="loading" className="mt-4 sm:mt-8 lg:mt-12 hidden lg:block" width={100} />
                      </div>

                      <div className="w-full lg:w-[35%] relative mx-auto flex flex-col items-center mt-4 lg:mt-0">
                        {campaign.staticDateImage ? (
                          <Image src={campaign.staticDateImage} alt="campaign date" className="object-contain h-[160px] lg:h-[260px] w-auto" />
                        ) : (
                          <>
                            <Image src={DateWrapper} alt="product image" className="object-contain h-[100px] sm:h-[150px] lg:h-[300px] hidden lg:flex" />
                            <div className="absolute top-[0px] sm:top-[60px] lg:top-[80px] inset-x-0 flex flex-col items-center">
                              <CalendarIcon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 hidden lg:flex" />
                              <div className="mt-2 sm:mt-3 lg:mt-4 text-[#35515C] text-center text-[8px] sm:text-[10px] lg:text-sm font-bricolage_grotesque flex space-x-4 lg:block lg:space-x-0">
                                <FromText className="text-center mx-auto hidden lg:flex" />
                                <p>{formatDate(campaign.startDateTime)}</p>
                                <p>-</p>
                                <p>{formatDate(campaign.endDateTime)}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </React.Fragment>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
