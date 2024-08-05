import OrdersOverview from '@/components/ui/dashboard/home/OrdersOverview';
import React from 'react';

export const metadata = {
  title: 'Hobink | Dashboard',
  description: 'Streamline your business processes',
};

const Dashboard: React.FC = () => {
  return (
    <span className='flex md:flex-row flex-col gap-3'>
      <OrdersOverview />
    </span>
  );
};

export default Dashboard;
