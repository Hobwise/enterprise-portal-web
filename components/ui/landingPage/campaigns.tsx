'use client';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { CampaignIcon } from '@/public/assets/svg';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import React, { useEffect, useState } from 'react';
import { getCampaigns } from '@/app/api/controllers/landingPage';
import { formatDate, getInitials2, notify } from '@/lib/utils';
import { Skeleton } from './skeleton-loading';
import CarouselLoading from '@/public/assets/images/loading-carousel.png';
import DateWrapper from '@/public/assets/images/date-wrapper.png';
import { CalendarIcon, FromText, LocationIcon } from '@/public/assets/svg';

export default function Campaigns() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1 rounded-full text-xs lg:mx-auto shadow_custom-inset';

  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<
    {
      businessLogo: string;
      campaignDescription: string;
      campaignName: string;
      dressCode: string;
      endDateTime: string;
      startDateTime: string;
      businessName: string;
      image: string;
      businessAddress: string;
    }[]
  >([]);
  const [error, setError] = useState<string>('');

  const getAllCampaigns = async (loading = true) => {
    setIsLoading(loading);
    const data = await getCampaigns();
    setIsLoading(false);

    console.log(data, '-> data');

    if (data?.data?.isSuccessful) {
      setCampaigns(data?.data?.data);
    } else if (data?.data?.error) {
      setError(data?.data?.error);
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getAllCampaigns();
  }, []);

  if (isLoading) return <Skeleton className="w-full h-[350px]" />;

  if (error) return null;

  return (
    <React.Fragment>
      {campaigns.length > 0 ? (
        <section className="bg-white py-8 lg:py-16 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12">
          <div className={sectionHeaderClass}>
            <CampaignIcon />
            <p className="font-normal">Campaigns</p>
          </div>
          <div className="lg:w-[85%] lg:mx-auto">
            <h2 className="text-[24px] text-left lg:text-center lg:text-[40px] text-[#161618] lg:leading-[64px] font-bricolage_grotesque">
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
                {campaigns.map((campaign, index) => (
                  <React.Fragment key={campaign.campaignName}>
                    <CarouselItem className=" w-full">
                      <div className="w-full relative h-[170px] lg:h-[350px] bg-[#EDF6FF] flex flex-col lg:flex-row px-4 sm:px-6 lg:px-10 lg:space-x-10 items-center rounded-xl">
                        <div className="w-[30%] lg:w-[25%] mb-4 lg:mb-0">
                          {campaign.image ? (
                            <img src={`data:image/png;base64,${campaign.image}`} alt="product image" className="object-contain mx-auto lg:h-[300px]" />
                          ) : (
                            <div className="w-full lg:h-[300px] rounded-lg bg-[#DDDCFE] text-primaryColor font-medium text-[24px] lg:text-[80px] font-bricolage_grotesque flex items-center justify-center">
                              <p>{getInitials2(campaign?.businessName)}</p>
                            </div>
                          )}
                        </div>

                        <div className="w-full lg:w-[75%] flex flex-col lg:flex-row items-center lg:space-x-6">
                          <div className="text-center lg:text-left w-full lg:w-[65%]">
                            <p className="font-light font-satoshi text-[10px] sm:text-[12px] lg:text-[20px] text-[#222222] truncate">{campaign.businessName}</p>
                            <p className="font-bricolage_grotesque text-[12px] sm:text-[16px] lg:text-[40px] text-[#171D22]">{campaign.campaignName}</p>
                            <p className="font-satoshi text-[8px] sm:text-[10px] lg:text-[20px] text-[#55626A] multi-truncate">
                              {campaign.campaignDescription}
                            </p>
                            <div className="flex space-x-2 items-center mt-2">
                              <LocationIcon />
                              <p className="text-xs font-light truncate text-[#55626A]">{campaign.businessAddress}</p>
                            </div>
                            <img src={CarouselLoading.src} alt="loading" className="mt-4 sm:mt-8 lg:mt-16 hidden lg:block" width={100} />
                          </div>

                          <div className="w-full lg:w-[35%] relative mx-auto flex flex-col items-center">
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
      ) : null}
    </React.Fragment>
  );
}
