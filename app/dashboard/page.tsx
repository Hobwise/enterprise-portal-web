'use client';
import Container from '@/components/dashboardContainer';
import { notify } from '@/lib/utils';

import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <Container>
      <span
        onClick={() =>
          notify({
            title: 'Error!',
            text: 'Something went wrong',
            type: 'error',
          })
        }
        className='font-bold text-4xl'
      >
        Home
      </span>
    </Container>
  );
};

export default Dashboard;
