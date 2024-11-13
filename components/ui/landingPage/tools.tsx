import { ChartIcon, CpuCharge, DocumentIcon, ManagementIcon, NotificationIcon, SecurityIcon } from '@/public/assets/svg';
import { Transition } from './transition';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export default function BestTools() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const tools = [
    {
      title: 'Real-Time Business Insights',
      description: 'Stay on top of things with up-to-date insights that empower you to make confident decisions for your business, no matter where you are.',
      icon: <ChartIcon className="text-white" />,
      color: '#FF844B',
      textColor: '#FFF',
      textColor2: '#FFF',
      shapeColor: '#FFD259',
      radius: isDesktop ? '20px 0px 0px 0px' : '0px 0px 0px 0px',
    },
    {
      title: 'Effortless Reservation Management',
      description:
        'Whether you’re running a single venue or multiple locations, Hobink makes it simple to manage reservations smoothly and keep your guests happy.',
      icon: <ManagementIcon className="text-dark" />,
      color: '#FAF0CA',
      textColor: '#855D06',
      textColor2: '#222222',
      shapeColor: '#F4DF8F',
      radius: '0px 0px 0px 0px',
    },
    {
      title: 'Custom Alerts Just for You',
      description: "Set up personalized notifications so you're always in the know about key moments and trends that affect your business—on your terms.",
      icon: <NotificationIcon className="text-[#161618]" />,
      color: '#F6F5FE',
      textColor: '#161618',
      textColor2: '#677182',
      shapeColor: '#9F7CFE',
      radius: '0px 20px 0px 0px',
    },
    {
      title: 'Deep Dive Analytics & Reports',
      description:
        'Gain a deeper understanding of how your business is doing with easy-to-read analytics and reports, so you can spot opportunities to grow and thrive.',
      icon: <CpuCharge className="text-[#23453F]" />,
      color: '#EBE8D8',
      textColor: '#23453F',
      textColor2: '#23453F',
      shapeColor: '#FFF',
      radius: isDesktop ? '0px 0px 0px 20px' : '0px 0px 0px 0px',
    },
    {
      title: 'Strong Security, Peace of Mind',
      description: 'With features like two-factor authentication and encrypted data, you can rest easy knowing your business and customer information is safe.',
      icon: <SecurityIcon className="text-[#202020]" />,
      color: '#5DCCA0',
      textColor: '#202020',
      textColor2: '#202020',
      shapeColor: '#F8FD91',
      radius: '0px 0px 0px 0px',
    },
    {
      title: 'Tailored Tips & Recommendations',
      description: 'Receive customized insights and helpful suggestions that are designed just for your business, helping you improve and grow effortlessly.',
      icon: <DocumentIcon className="text-[#000]" />,
      color: '#FFF3EA',
      textColor: '#060807',
      textColor2: '#060807',
      shapeColor: '#D0EFEF',
      radius: isDesktop ? '0px 0px 20px 0px' : '0px 0px 0px 0px',
    },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-10">
      {tools.map((each, index) => (
        <Transition key={each.title}>
          <div
            className="text-left p-6 space-y-12 relative min-h-[350px]"
            style={{ background: each.color, backdropFilter: 'blur(18px)', borderRadius: each.radius }}
          >
            <div
              className={cn('rounded-bl-[50px] rounded-br-[50px]  h-32 w-24 absolute right-0 top-0', index === 2 ? 'rounded-tr-[20px]' : 'rounded-tr-[0px]')}
              style={{ background: each.shapeColor }}
            />
            <div className="">{each.icon}</div>
            <div className="space-y-2">
              <p className="font-bold text-[20px]" style={{ color: each.textColor }}>
                {each.title}
              </p>
              <p className="text-[18px]" style={{ color: each.textColor2 }}>
                {each.description}
              </p>
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
}
