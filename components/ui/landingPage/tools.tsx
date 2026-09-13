import {
  BookingSidebar,
  NotificationIcon,
  SecurityIcon,
  StockAnalysisIcon,
} from '@/public/assets/svg';
import { FiBell } from 'react-icons/fi';
import { PiSparkleFill } from 'react-icons/pi';
import { Transition } from './transition';

export default function BestTools() {
  const tools = [
    {
      title: 'Business Insights & Reporting',
      description:
        'Monitor performance, track trends, and access reports that help you make informed business decisions.',
      icon: <NotificationIcon className='w-11 h-11 text-white' />,
      color: '#FF844B',
      textColor: '#FFF',
      textColor2: '#FFF',
      shapeColor: '#FF9D5B',
    },
    {
      title: 'Effortless Reservation Management',
      description:
        'Handle bookings efficiently and keep guest experiences running smoothly.',
      icon: <BookingSidebar className='w-11 h-11 text-[#161618]' />,
      color: '#FAF0CA',
      textColor: '#855D06',
      textColor2: '#222222',
      shapeColor: '#F4DF8F',
    },
    {
      title: 'Custom Alerts Just for You',
      description:
        'Receive timely alerts for bookings, orders, inventory updates, and important business activities.',
      icon: <FiBell size={42} className='text-[#161618]' />,
      color: '#F6F5FE',
      textColor: '#161618',
      textColor2: '#677182',
      shapeColor: '#C3ADFF',
    },
    {
      title: 'Performance Analytics',
      description:
        'Understand customer behavior, revenue trends, and operational performance through detailed reporting.',
      icon: <StockAnalysisIcon className='w-11 h-11 text-[#23453F]' />,
      color: '#EBE8D8',
      textColor: '#23453F',
      textColor2: '#23453F',
      shapeColor: '#FFFFFF',
    },
    {
      title: 'Secure & Reliable Operations',
      description:
        'Protect your business data with enterprise-grade security and dependable infrastructure.',
      icon: <SecurityIcon className='w-11 h-11 text-white' />,
      color: '#5DCCA0',
      textColor: '#202020',
      textColor2: '#202020',
      shapeColor: '#37BE7B',
    },
    {
      title: 'Built-In AI Assistant',
      description:
        'Ask questions, learn platform workflows, get feature guidance, and receive instant help whenever you need it.',
      icon: <PiSparkleFill size={40} className='text-[#060807]' />,
      color: '#FFF3EA',
      textColor: '#060807',
      textColor2: '#060807',
      shapeColor: '#D0EFEF',
    },
  ];
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 pt-10'>
      {tools.map((each) => (
        <Transition key={each.title}>
          <div
            className='text-left p-8 relative min-h-[340px] overflow-hidden rounded-[20px]'
            style={{
              background: each.color,
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className='absolute right-6 top-6 h-14 w-14 rounded-full' style={{ background: each.shapeColor }} />
            <div className='absolute right-[68px] top-14 h-7 w-7 rounded-full' style={{ background: each.shapeColor }} />
            <div className='relative z-10'>{each.icon}</div>
            <div className='space-y-3 relative z-10 pt-12'>
              <p
                className='font-bold text-[20px]'
                style={{ color: each.textColor }}
              >
                {each.title}
              </p>
              <p className='text-[16px] leading-relaxed' style={{ color: each.textColor2 }}>
                {each.description}
              </p>
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
}
