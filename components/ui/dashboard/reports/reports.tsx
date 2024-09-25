import { Card, CardBody, Divider, Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Chart } from 'react-google-charts';
import { BsArrowUpShort } from 'react-icons/bs';
import { IoIosArrowForward } from 'react-icons/io';
import Accepted from '../../../../public/assets/icons/accepted.png';
import Decline from '../../../../public/assets/icons/canceled.png';
import Cancel from '../../../../public/assets/icons/declined.png';
import Like from '../../../../public/assets/icons/like.png';
import Star from '../../../../public/assets/icons/star.png';

const data = [
  ['Day', 'Value'],
  ['Wed', 60],
  ['Thu', 90],
  ['Fri', 70],
  ['Sat', 80],
  ['Sun', 90],
  ['Mon', 70],
  ['Tue', 100],
];

const options = {
  curveType: 'function',
  legend: { position: 'none' },
  hAxis: { textPosition: 'out' },
  vAxis: { textPosition: 'out' },
  chartArea: { width: '95%', height: '80%' },
  colors: ['#8884d8'],
  backgroundColor: 'transparent',
};

const ReportDetails = () => {
  const reportData = [
    {
      icon: <Image src={Accepted} alt='accepted' />,
      title: 'ACCEPTED',
      desc: '2980',
    },
    {
      icon: <Image src={Decline} alt='decline' />,
      title: 'DECLINED',
      desc: '101',
    },
    {
      icon: <Image src={Cancel} alt='cancel' />,
      title: 'CANCELLED',
      desc: '24',
    },
    {
      icon: <Image src={Like} alt='like' />,
      title: 'CLOSED',
      desc: '2765',
    },
  ];

  const router = useRouter();
  const AvailableReport = ['Completed orders', 'All orders', 'Food orders'];
  const handleActivityReport = (activity: string) => {
    router.push(`/dashboard/reports/${activity}`);
  };
  return (
    <div className=' flex lg:flex-row flex-col gap-4 mb-4'>
      <div className='lg:w-[77%] w-full'>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4'>
          {reportData.map((item, index) => (
            <Card className='bg-[#EBE8F9] '>
              <CardBody key={index} className='space-y-2 p-4'>
                {item.icon}
                <p className='text-sm text-gray-500'>{item.title}</p>
                <p className='text-2xl font-bold'>{item.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className='mb-4 bg-[#F5F5F5]'>
          <CardBody>
            <Chart
              chartType='LineChart'
              width='100%'
              height='200px'
              data={data}
              options={options}
            />
          </CardBody>
        </Card>

        <div>
          <h3 className='text-lg font-semibold mb-2'>Available reports</h3>
          <Divider />
          <Spacer y={4} />
          <div>
            {AvailableReport.map((item) => (
              <div
                onClick={() => handleActivityReport(item)}
                key={item}
                className='cursor-pointer'
              >
                <div className='flex justify-between'>
                  <p className='hover:text-gray-100'>{item}</p>
                  <IoIosArrowForward className='text-grey600' />
                </div>
                <Divider className='bg-primaryGrey my-2' />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='h-full flex-grow'>
        <Card className='border  bg-gradient-to-r text-white from-[#9747FF] to-[#421CAC] border-primaryGrey rounded-xl mb-4 h-[247px]'>
          <div>
            <div className='p-4'>
              <h2 className='font-medium'>ALL ORDERS</h2>
              <h1 className='text-2xl font-[600] my-[5px]'>2909</h1>
              <div
                className={`text-sm ${'text-success-300'}  font-[500] flex items-center`}
              >
                <BsArrowUpShort className={` text-[20px]`} />
                <p>10%</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className='bg-[#FDF5E1] lg:h-[348px] h-full'>
          <CardBody className=' p-4'>
            <div className='mb-4'>
              <Image src={Star} alt='star' />
            </div>

            <p className='font-[500]'>Day with highest payment</p>
            <p className='text-[28px] font-semibold'>950,000</p>
            <p className='text-sm'>TUE, OCT 17</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
export default ReportDetails;
