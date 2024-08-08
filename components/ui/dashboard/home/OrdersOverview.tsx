'use client';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { useMemo, useState } from 'react';
import { Chart } from 'react-google-charts';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import { MdKeyboardArrowDown } from 'react-icons/md';

const OrdersOverview = () => {
  const data = [
    ['Day', 'Processed orders', 'Pending orders'],
    ['Wednesday', 280, 0],
    ['Thursday', 490, 0],
    ['Friday', 560, 0],
    ['Saturday', 670, 0],
    ['Sunday', 650, 0],
    ['Monday', 200, 0],
    ['Today', 100, 0],
  ];

  const options = {
    // title: 'Orders',
    // curveType: 'function',

    colors: ['#5F35D2', '#005E2B'],
    // hAxis: {
    //   title: 'Day',
    // },
    legend: { position: 'none' },
    vAxis: {
      gridlines: { color: 'transparent' },
      baselineColor: 'transparent',
      minValue: 0,
      maxValue: 1000,
      ticks: [0, 250, 500, 750, 1000],
    },
    bar: { groupWidth: '35%' },
    series: {
      0: { type: 'bars' },
      1: { type: 'bars' },
    },
    isStacked: true,
  };

  const [selectedKeys, setSelectedKeys] = useState(new Set(['This week']));

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );

  const curveData = [
    ['Month', 'Amount'],
    ['Jan', 2000000],
    ['Feb', 2800000],
    ['Mar', 2400000],
    ['Apr', 2600000],
    ['May', 3456750],
  ];

  const curveOptions = {
    title: '',
    hAxis: { textPosition: 'none' },
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
    enableInteractivity: false,
  };

  return (
    <section className='w-full'>
      <article className='flex md:gap-6 gap-3 lg:flex-row flex-col'>
        <div className='border border-primaryGrey lg:w-[70%] w-full rounded-xl'>
          <div className='flex justify-between items-center border-b border-primaryGrey p-3'>
            <span className='font-[600]'>Overview</span>
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
                <DropdownItem key='Monthly'>Monthly</DropdownItem>
                <DropdownItem key='Yearly'>Yearly</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className='p-3'>
            <div className='flex gap-12 flex-wrap'>
              <div className='flex flex-col'>
                <span className='text-[13px] font-[500] text-[#4A4C4F]'>
                  Total orders
                </span>
                <span className='flex gap-4'>
                  <span className='text-[24px] font-[600]'>3,456</span>
                  <span className='text-success-500 flex items-center font-[400]'>
                    <IoArrowUpCircleOutline /> <span> 2.5%</span>
                  </span>
                </span>
              </div>
              <div className='flex flex-col'>
                <div className='text-[13px] flex items-center gap-1 font-[500] text-[#4A4C4F]'>
                  <div className='h-2 w-2 rounded-full bg-primaryColor' />
                  <span> Processed orders</span>
                </div>
                <span className='text-[24px] font-[600]'> 1,586</span>
              </div>
              <div className='flex flex-col'>
                <div className='text-[13px] flex  items-center gap-1 font-[500] text-[#4A4C4F]'>
                  <div className='h-2 w-2 rounded-full bg-success-800' />
                  <span>Pending orders</span>
                </div>
                <span className='text-[24px] font-[600]'>1,896</span>
              </div>
            </div>
            <Divider className='my-3 bg-primaryGrey' />

            <Chart
              chartType='ComboChart'
              width='100%'
              height='200px'
              data={data}
              options={options}
            />
          </div>
        </div>
        <div className='flex-grow border bg-gradient-to-r text-white from-[#9747FF] to-[#421CAC] border-primaryGrey rounded-xl'>
          <div>
            <div className='p-4'>
              <h2 className='font-medium mb-2'>Total amount processed</h2>
              <h1 className='text-2xl font-[600] my-[10px]'>₦3,456,750</h1>
              <p className='text-sm text-success-300 font-[500]'>
                ↑ 20% since last month
              </p>
            </div>
            <div className='lg:mt-10 mt-0'>
              <Chart
                chartType='AreaChart'
                width='100%'
                // height='200px'
                data={curveData}
                options={curveOptions}
              />
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default OrdersOverview;
