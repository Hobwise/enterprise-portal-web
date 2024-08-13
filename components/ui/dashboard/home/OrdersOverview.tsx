'use client';
import { formatPrice } from '@/lib/utils';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import moment from 'moment';
import { Chart } from 'react-google-charts';
import { BsArrowUpShort } from 'react-icons/bs';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import { MdKeyboardArrowDown } from 'react-icons/md';
import EmptyOverview from './emptyOverview';
import SkeletonLoaderOrder from './skeletonLoadingOrders';

const OrdersOverview = ({
  response,
  isLoading,
  selectedKeys,
  setSelectedKeys,
  selectedValue,
  onOpen,
  value,
}: any) => {
  const transformedData = response && [
    ['Month', 'Processed orders', 'Pending orders'],
    ...response?.orderDetails?.orderPartitions?.map((item: any) => [
      item.partitionName,
      item.count,
      0,
    ]),
  ];
  const curveData = response && [
    ['Month', 'Amount'],
    ...response?.paymentDetails?.paymentPartitions?.map((item: any) => [
      item.partitionName,
      item.count,
    ]),
  ];

  // function getSortedUniqueCounts(data) {
  //   const counts = data?.map((item) => item.count);

  //   const uniqueCounts = [...new Set(counts)];

  //   const sortedCounts = uniqueCounts.sort((a, b) => a - b);

  //   return sortedCounts;
  // }

  const options = {
    colors: ['#5F35D2', '#005E2B'],

    legend: { position: 'none' },
    vAxis: {
      gridlines: { color: 'transparent' },
      baselineColor: 'transparent',
      minValue: 0,
      maxValue: 1000,
      // ticks: getSortedUniqueCounts(response?.orderDetails?.orderPartitions),
      ticks: [0, 250, 500, 750, 1000],
    },
    bar: { groupWidth: '35%' },
    series: {
      0: { type: 'bars' },
      1: { type: 'bars' },
    },
    isStacked: true,
  };

  const curveOptions = {
    title: '',
    hAxis: {
      textPosition: 'none',
      baselineColor: 'none',
      gridlines: { color: 'transparent' },
      minorGridlines: { color: 'transparent' },
    },
    vAxis: { textPosition: 'none', gridlines: { color: 'transparent' } },
    legend: { position: 'none' },
    chartArea: { width: '100%', height: '100%' },
    colors: ['#9747FF', '#421CAC'],
    areaOpacity: 0.3,
    backgroundColor: 'transparent',
    series: {
      0: {
        lineWidth: 2,
        curveType: 'function',
      },
    },
    interpolateNulls: true,
    enableInteractivity: true,
  };

  if (isLoading) {
    return <SkeletonLoaderOrder />;
  }

  return (
    <section className='w-full'>
      <article className='flex md:gap-6 gap-3 lg:flex-row flex-col'>
        <div className='border border-primaryGrey lg:w-[70%] w-full rounded-xl'>
          <div className='flex justify-between items-center flex-wrap border-b border-primaryGrey p-3'>
            <span className='font-[600]'>Overview</span>
            {selectedValue === 'Custom date' && (
              <p className='text-default-500 text-sm'>
                Selected date:{' '}
                {value.start && moment(value?.start).format('MMMM Do YYYY')}
                {' -- '}
                {value.end && moment(value?.end).format('MMMM Do YYYY')}
              </p>
            )}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant='light'
                  endContent={<MdKeyboardArrowDown />}
                  className='font-[600] capitalize text-black'
                >
                  {selectedValue}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label='Single selection example'
                variant='flat'
                disallowEmptySelection
                selectionMode='single'
                className='text-black'
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
              >
                <DropdownItem key='Daily'>Daily</DropdownItem>
                <DropdownItem key='This week'>This week</DropdownItem>
                <DropdownItem key='Yearly'>Yearly</DropdownItem>
                <DropdownItem onClick={() => onOpen()} key='Custom date'>
                  Custom date
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className='p-3 '>
            {response?.orderDetails.orderPartitions.length === 0 ||
            response === undefined ? (
              <EmptyOverview
                title='active orders'
                buttonText='Place order'
                href='/dashboard/orders'
              />
            ) : (
              <>
                <div className='flex gap-12 flex-wrap'>
                  <div className='flex flex-col'>
                    <span className='text-[13px] font-[500] text-[#4A4C4F]'>
                      Total orders
                    </span>
                    <span className='flex gap-2'>
                      <span className='text-[24px] font-[600]'>
                        {response?.orderDetails.totalOrders}
                      </span>
                      <span
                        className={` ${
                          parseInt(response?.orderDetails.percentageChange) <= 0
                            ? `text-danger-500`
                            : `text-success-500`
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(response?.orderDetails.percentageChange) <=
                              0 && 'rotate-180'
                          }`}
                        />{' '}
                        <span>{response?.orderDetails.percentageChange}%</span>
                      </span>
                    </span>
                  </div>
                  <div className='flex flex-col'>
                    <div className='text-[13px] flex items-center gap-1 font-[500] text-[#4A4C4F]'>
                      <div className='h-2 w-2 rounded-full bg-primaryColor' />
                      <span> Processed orders</span>
                    </div>
                    <span className='text-[24px] font-[600]'>
                      {response?.orderDetails.processedOrder}
                    </span>
                  </div>
                  <div className='flex flex-col'>
                    <div className='text-[13px] flex  items-center gap-1 font-[500] text-[#4A4C4F]'>
                      <div className='h-2 w-2 rounded-full bg-success-800' />
                      <span>Pending orders</span>
                    </div>
                    <span className='text-[24px] font-[600]'>
                      {response?.orderDetails.pendingOrders}
                    </span>
                  </div>
                </div>
                <Divider className='my-3 bg-primaryGrey' />
                <Chart
                  chartType='ComboChart'
                  width='100%'
                  height='200px'
                  data={transformedData}
                  options={options}
                />{' '}
              </>
            )}
          </div>
        </div>
        <div className='flex-grow border bg-gradient-to-r text-white from-[#9747FF] to-[#421CAC] border-primaryGrey rounded-xl'>
          <div>
            <div className='p-4'>
              <h2 className='font-medium mb-2'>Total amount processed</h2>
              <h1 className='text-2xl font-[600] my-[10px]'>
                {formatPrice(
                  response?.paymentDetails.totalAmountProcessed || 0
                )}
              </h1>
              <div
                className={`text-sm ${
                  response?.paymentDetails.percentageChange <= 0
                    ? 'text-danger-300'
                    : 'text-success-300'
                }  font-[500] flex items-center`}
              >
                <BsArrowUpShort
                  className={`${
                    response?.paymentDetails.percentageChange <= 0 &&
                    'rotate-180'
                  } text-[20px]`}
                />
                <p>
                  {response?.paymentDetails.percentageChange || 0}% since last
                  month
                </p>
              </div>
            </div>

            {response === undefined ||
            response?.paymentDetails.paymentPartitions.length === 0 ? (
              ''
            ) : (
              <div className='lg:mt-10 mt-0'>
                <Chart
                  chartType='AreaChart'
                  width='100%'
                  data={curveData}
                  options={curveOptions}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
};

export default OrdersOverview;
