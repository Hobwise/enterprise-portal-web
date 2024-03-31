import React from 'react';
import Container from '../../../components/dashboardContainer';

export const metadata = {
  title: 'Settings page',
  description:
    'Take a look at your polices and the new policy to see what is covered',
};

const Settings: React.FC = () => {
  return (
    <Container>
      <span className='font-bold text-4xl'>Settings</span>
      {/* <h1 className='text-[28px] leading-8 font-bold'>Settings</h1>
      <p className='text-sm md:w-[400px] w-full  text-center text-grey600 mb-10'>
        Take a look at your polices and the new policy to see what is covered
      </p> */}
    </Container>
  );
};

export default Settings;
