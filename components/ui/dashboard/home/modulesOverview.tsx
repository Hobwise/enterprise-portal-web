'use client';

import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import Chart from 'react-google-charts';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import Chandon from '../../../../public/assets/images/no-image.svg';

const ModulesOverview = () => {
  const pieData = [
    ['Payment Method', 'Amount'],
    ['PoS', 30],
    ['Cash', 20],
    ['Transfer', 25],
    ['Others', 25],
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

  const tableData = [
    ['Table', 'QR'],
    ['Table 1', 70],
    ['Table 2', 80],
    ['Table 3', 65],
    ['Table 4', 90],
    ['Table 5', 50],
    ['VIP 1', 85],
    ['VIP 2', 60],
  ];

  const tableOptions = {
    legend: { position: 'none' },
    hAxis: {
      minValue: 0,
      maxValue: 100,
      textPosition: 'out',
      gridlines: { color: 'transparent' },
      baselineColor: 'transparent',
    },
    vAxis: {
      textPosition: 'none',

      textStyle: {
        fontSize: 14,

        color: '#4A4C4F',
      },
    },

    // vAxis: { textPosition: 'none', gridlines: { color: 'transparent' } },
    bar: { groupWidth: '30%', cornerRadius: 8 },
    colors: ['#6F52ED'],
    chartArea: { width: '100%', height: '100%' },
  };

  const bestSellers = [
    {
      product: 'Moet & Chandon',
      type: 'Drinks',
      price: '2500000',
    },
    {
      product: 'Moet & Chandon',
      type: 'Drinks',
      price: '2500000',
    },
    {
      product: 'Moet & Chandon',
      type: 'Drinks',
      price: '2500000',
    },
    {
      product: 'Moet & Chandon',
      type: 'Drinks',
      price: '2500000',
    },
  ];
  const campaigns = [
    {
      title: 'Ladies Night',
      desc: 'Karaoke, drinks and chill for the ladies every week. ',
      startDate: 'Apr 17',
    },
    {
      title: 'Ladies Night',
      desc: 'Karaoke, drinks and chill for the ladies every week. ',
      startDate: 'Apr 17',
    },
  ];

  return (
    <section className='w-full'>
      <article className='flex md:gap-6 gap-3 lg:flex-row flex-col'>
        <div className='lg:w-[70%] flex flex-col lg:flex-row lg:gap-5 gap-3 w-full'>
          <div className='flex lg:w-[70%] w-full flex-col lg:gap-5 gap-3'>
            <div className='flex xl:flex-row flex-col lg:gap-5 gap-3'>
              <div className='border border-primaryGrey rounded-xl flex-grow'>
                <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                  <span className='font-[600]'>Payments</span>
                </div>
                <div className=''>
                  <div className='w-[230px] h-[150px] mx-auto'>
                    <Chart
                      chartType='PieChart'
                      width='100%'
                      height='100%'
                      data={pieData}
                      options={pieOptions}
                    />
                  </div>
                </div>
              </div>
              <div className='border  flex-grow border-primaryGrey rounded-xl'>
                <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                  <span className='font-[600]'>Bookings</span>
                </div>
                <div className='p-6 flex h-[150px] items-center space-x-6'>
                  <div className='flex flex-col'>
                    <span className='text-[13px] font-[500] space-y-1 text-[#4A4C4F]'>
                      Accepted
                    </span>
                    <span className='text-[24px] font-[600]'>64</span>
                    <span className='text-success-500 flex items-center font-[400]'>
                      <IoArrowUpCircleOutline /> <span> 2.5%</span>
                    </span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-[13px] font-[500] text-[#4A4C4F]'>
                      Closed
                    </span>
                    <span className='text-[24px] font-[600]'>64</span>
                    <span className='text-success-500 flex items-center font-[400]'>
                      <IoArrowUpCircleOutline /> <span> 2.5%</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='border flex-grow border-primaryGrey rounded-xl'>
              <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
                <span className='font-[600]'>Campaigns</span>
              </div>
              <div className='p-4 space-y-3'>
                {campaigns.map((item, index) => (
                  <div key={index} className='flex gap-4 '>
                    <Image
                      className='h-[60px] w-[60px] bg-cover rounded-lg'
                      width={60}
                      height={60}
                      alt='menu'
                      aria-label='menu'
                      src={Chandon}
                      // src={
                      //   menu.image ? `data:image/jpeg;base64,${menu.image}` : noImage
                      // }
                    />

                    <div className='flex lg:flex-row justify-between lg:items-center items-start w-full flex-col lg:gap-4 gap-0'>
                      <div className=' gap-1 grid place-content-center'>
                        <p className='font-bold text-sm'>{item.title}</p>
                        <p className=' text-sm'>{item.desc}</p>
                      </div>
                      <div className=' gap-1 '>
                        <p className='font-bold text-sm'>Start</p>
                        <p className=' text-sm'>{item.startDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  className='grid place-content-center text-sm text-primaryColor w-full'
                  href='/dashboard/campaigns'
                >
                  View more campaigns
                </Link>
              </div>
            </div>
          </div>
          <div className='border flex-grow border-primaryGrey rounded-xl'>
            <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
              <span className='font-[600]'>Best sellers</span>
            </div>
            <div className='p-3 space-y-4'>
              {bestSellers.map((item, index) => (
                <div key={index} className='flex gap-4 justify-between'>
                  <div className=' gap-1 grid place-content-center'>
                    <p className='font-bold text-sm'>{item.product}</p>
                    <p className=' text-sm'>{item.type}</p>
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
                    src={Chandon}
                    // src={
                    //   menu.image ? `data:image/jpeg;base64,${menu.image}` : noImage
                    // }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='border flex-grow border-primaryGrey p-3 rounded-xl'>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-success-800' />
            <span className='font-[600]'>QR Code</span>
          </div>
          <div className='p-3'>
            <div className='w-full max-w-[300px]  relative'>
              <h1 className='text-[28px] font-bold text-[#4A4C4F] mb-4'>7</h1>
              <Chart
                chartType='BarChart'
                width='100%'
                height='300px'
                data={tableData}
                options={tableOptions}
              />
              <div className='absolute top-12 space-y-6'>
                {tableData.slice(1).map((item) => (
                  <div className='text-black text-sm'>
                    <p>{item[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ModulesOverview;
