import Container from '@/components/dashboardContainer';

import React from 'react';

export const metadata = {
  title: 'Hobink | Dashboard',
  description: 'Streamline your business processes',
};

const Dashboard: React.FC = () => {
  return (
    <Container>
      <span className='font-bold text-4xl'>Home</span>
    </Container>
  );
};

export default Dashboard;
