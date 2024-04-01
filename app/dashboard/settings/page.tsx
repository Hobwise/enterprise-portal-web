import React from 'react';
import Container from '../../../components/dashboardContainer';
import { Spacer } from '@nextui-org/react';
import SettingsComponent from '@/components/ui/dashboard/settings/settings';

export const metadata = {
  title: 'Settings page',
  description:
    'Take a look at your polices and the new policy to see what is covered',
};

const Settings: React.FC = () => {
  return (
    <Container>
      <h1 className='text-[28px] leading-8 font-bold'>Settings</h1>
      <p className='text-sm  text-grey600 mb-10'>
        Take a look at your polices and the new policy to see what is covered
      </p>
      <Spacer y={8} />
      <section className='flex xl:flex-row flex-col xl:w-[862px] w-full gap-3'>
        <SettingsComponent />
      </section>
    </Container>
  );
};

export default Settings;
