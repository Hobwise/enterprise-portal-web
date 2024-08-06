import OrdersOverview from '@/components/ui/dashboard/home/OrdersOverview';
import ModulesOverview from '@/components/ui/dashboard/home/modulesOverview';
import React from 'react';

export const metadata = {
  title: 'Hobink | Dashboard',
  description: 'Streamline your business processes',
};

const Dashboard: React.FC = () => {
  return (
    <span className='flex flex-col xl:gap-5 gap-3'>
      <OrdersOverview />
      <ModulesOverview />
    </span>
  );
};

export default Dashboard;
