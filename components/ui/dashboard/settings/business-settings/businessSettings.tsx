'use client';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Tab, Tabs } from '@nextui-org/react';
import EmailTemplate from './emailTemplate';
import TermsCondition from './terms&condition';
import UpdateBusiness from './updateBusiness';

export default function BusinessSettings({ setActiveScreen }: any) {
  const businessInformation = getJsonItemFromLocalStorage('business') || [];
  const showBusinessSettings = businessInformation[0]?.primaryColor === '';

  let tabs = [
    // ...(showBusinessSettings
    //   ? [
    //       {
    //         id: 'Update business',
    //         label: 'Update business',
    //         content: <RegisterBusiness setActiveScreen={setActiveScreen} />,
    //       },
    //     ]
    //   : []),
    {
      id: 'Update business',
      label: 'Update business',

      content: <UpdateBusiness setActiveScreen={setActiveScreen} />,
    },
    {
      id: 'Email template',
      label: 'Email template',
      content: <EmailTemplate />,
    },
    {
      id: 'Terms and condition',
      label: 'Terms and condition',

      content: <TermsCondition />,
    },
  ];

  return (
    <div className='flex w-full flex-col'>
      <Tabs
        size='lg'
        fullWidth={true}
        className='w-full mb-2'
        aria-label='Business settings tab'
        items={tabs}
      >
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
