'use client';

import { formatPrice } from '@/lib/utils';
import moment from 'moment';
import Image from 'next/image';
import Chart from 'react-google-charts';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import { default as noImage } from '../../../../public/assets/images/no-image.svg';
import EmptyOverview from './emptyOverview';
import SkeletonLoaderModules from './skeletonLoadingModules';

const ModulesOverview = ({ response, isLoading }: any) => {
  const pieData = response && [
    ['Payment Method', 'Amount'],
    ...response?.paymentDetails?.paymentMethodCounts.map((item) => {
      let paymentMethod;

      switch (item.paymentMethod) {
        case 'Pos':
          paymentMethod = 'PoS';
          break;
        case 'BankTransfer':
          paymentMethod = 'Transfer';
          break;
        case 'CheckOut':
          paymentMethod = 'Others';
          break;
        default:
          paymentMethod = item.paymentMethod;
      }

      return [paymentMethod, item.count];
    }),
  ];

  const pieOptions = {
    pieHole: 0.7,
    colors: ['#6F52ED', '#FF69B4', '#1E90FF', '#3CB371'],
    legend: {
      position: 'right',
      alignment: 'center',
      textStyle: {
        color: '#4A4C4F',
        fontSize: 13,
        fontWeight: 500,
      },
    },
    pieSliceText: 'none',
    chartArea: { width: '90%', height: '90%' },
  };

  if (isLoading) {
    return <SkeletonLoaderModules />;
  }

  return (
    <section className='w-full'>
      <article className='flex md:gap-6 gap-3 lg:flex-row flex-col'>
        <div className='lg:w-[70%] flex flex-col lg:flex-row lg:gap-5 gap-3 w-full'>
          <div className='flex lg:w-[70%] w-full flex-col lg:gap-5 gap-3'>
            <div className='flex xl:flex-row flex-col lg:gap-5 gap-3'>
              <div className='border border-primaryGrey rounded-xl lg:w-[300px] w-full flex-grow'>
                <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                  <span className='font-[600]'>Payments</span>
                </div>
                <div className=''>
                  {response?.paymentDetails?.paymentMethodCounts.some(
                    (item) => item.count !== 0
                  ) ? (
                    <div className='w-[230px] h-[150px] mx-auto'>
                      <Chart
                        chartType='PieChart'
                        width='100%'
                        height='100%'
                        data={pieData}
                        options={pieOptions}
                      />
                    </div>
                  ) : (
                    <EmptyOverview title='payments' />
                  )}
                </div>
              </div>
              <div className='border  flex-grow border-primaryGrey rounded-xl'>
                <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                  <span className='font-[600]'>Bookings</span>
                </div>
                {response &&
                Object.values(response?.bookingDetails).some(
                  (value) => value !== 0
                ) ? (
                  <div className='p-6 flex h-[150px] items-center space-x-6'>
                    <div className='flex flex-col'>
                      <span className='text-[13px] font-[500] space-y-1 text-[#4A4C4F]'>
                        Total
                      </span>
                      <span className='text-[24px] font-[600]'>
                        {response?.bookingDetails.total}
                      </span>
                      <span
                        className={`${
                          parseInt(
                            response?.bookingDetails.toatlPercentageChange
                          ) <= 0
                            ? 'text-danger-500'
                            : 'text-success-500'
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(
                              response?.bookingDetails.toatlPercentageChange
                            ) <= 0 && 'rotate-180'
                          }`}
                        />{' '}
                        <span>
                          {' '}
                          {response?.bookingDetails.toatlPercentageChange}%
                        </span>
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[13px] font-[500] space-y-1 text-[#4A4C4F]'>
                        Accepted
                      </span>
                      <span className='text-[24px] font-[600]'>
                        {response?.bookingDetails.accepted}
                      </span>
                      <span
                        className={`${
                          parseInt(
                            response?.bookingDetails.acceptedPercentageChange
                          ) <= 0
                            ? 'text-danger-500'
                            : 'text-success-500'
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(
                              response?.bookingDetails.acceptedPercentageChange
                            ) <= 0 && 'rotate-180'
                          }`}
                        />{' '}
                        <span>
                          {' '}
                          {response?.bookingDetails.acceptedPercentageChange}%
                        </span>
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[13px] font-[500] text-[#4A4C4F]'>
                        Closed
                      </span>
                      <span className='text-[24px] font-[600]'>
                        {response?.bookingDetails.closed}
                      </span>
                      <span
                        className={`${
                          parseInt(
                            response?.bookingDetails.closedPercentageChange
                          ) <= 0
                            ? `text-danger-500`
                            : `text-success-500`
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(
                              response?.bookingDetails.closedPercentageChange
                            ) <= 0 && 'rotate-180'
                          }`}
                        />{' '}
                        <span>
                          {response?.bookingDetails.closedPercentageChange}%
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <EmptyOverview title='active bookings' />
                )}
              </div>
            </div>
            <div className='border flex-grow border-primaryGrey rounded-xl'>
              <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                <span className='font-[600]'>Campaigns</span>
              </div>
              {response?.campaigns.length === 0 || response === undefined ? (
                <EmptyOverview
                  title='active campaigns'
                  buttonText='Start a campaign'
                  href='/dashboard/campaigns/create-campaign'
                />
              ) : (
                <div className='p-4 space-y-3 overflow-scroll h-[170px]'>
                  {response?.campaigns.map((item, index) => (
                    <div key={index} className='flex gap-4 '>
                      <Image
                        className='h-[60px] w-[60px] bg-cover rounded-lg'
                        width={60}
                        height={60}
                        alt='menu'
                        aria-label='menu'
                        src={
                          item.image
                            ? `data:image/jpeg;base64,${item.image}`
                            : noImage
                        }
                      />

                      <div className='flex lg:flex-row justify-between lg:items-center items-start w-full flex-col lg:gap-4 gap-0'>
                        <div className=' gap-1 grid place-content-center'>
                          <p className='font-bold text-sm'>
                            {item.campaignName}
                          </p>
                          <p className=' text-sm'>{item.campaignDescription}</p>
                        </div>
                        <div className=' gap-1 '>
                          <p className='font-bold text-sm'>Start</p>
                          <p className=' text-sm'>
                            {moment(item.startDateTime).format('MMM DD')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* <Link
                  className='grid place-content-center text-sm text-primaryColor w-full'
                  href='/dashboard/campaigns'
                >
                  View more campaigns
                </Link> */}
                </div>
              )}
            </div>
          </div>
          <div className='border flex-grow border-primaryGrey rounded-xl'>
            <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
              <span className='font-[600]'>Best sellers</span>
            </div>
            {response?.bestSellers.length === 0 || response === undefined ? (
              <EmptyOverview
                title='active menus'
                buttonText='Create menu'
                href='/dashboard/menu'
              />
            ) : (
              <div className='p-3 space-y-4 overflow-scroll h-[400px]'>
                {response?.bestSellers.map((item: any) => (
                  <div key={item.itemID} className='flex gap-4 justify-between'>
                    <div className=' gap-1 grid place-content-center'>
                      <p className='font-bold text-sm'>{item.menu}</p>
                      <p className=' text-sm'>{item.itemName}</p>
                      <p className='font-bold text-sm'>
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <Image
                      className='h-[60px]  w-[60px] bg-cover rounded-lg'
                      width={60}
                      height={60}
                      alt='menu'
                      aria-label='menu'
                      src={
                        item.image
                          ? `data:image/jpeg;base64,${item.image}`
                          : noImage
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='border flex-grow border-primaryGrey p-3 rounded-xl'>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-success-800' />
            <span className='font-[600]'>QR Code</span>
          </div>
          {response?.quickResponseDetails.quickResponseRecord.length > 0 ? (
            <div className=''>
              <div className='w-full max-w-[300px]  relative overflow-scroll h-[400px]'>
                <h1 className='text-[28px] font-bold text-[#4A4C4F] mb-4'>
                  {response?.quickResponseDetails.totalQuickResponse}
                </h1>
                {response?.quickResponseDetails.quickResponseRecord.map(
                  (item, index) => (
                    <div key={index} className=' mb-2'>
                      <span className='flex-1 text-sm'>
                        {item.quickResponseName}
                      </span>
                      <div
                        className='h-2 max-w-full rounded-full bg-[#5F35D2]'
                        style={{ width: `${item.count}%` }}
                      ></div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <EmptyOverview
              title='active QR codes'
              buttonText='Create QR'
              href='/dashboard/qr-code/create-qr'
            />
          )}
        </div>
      </article>
    </section>
  );
};

export default ModulesOverview;
