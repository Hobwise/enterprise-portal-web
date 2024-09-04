import dynamic from 'next/dynamic';
import React from 'react';
import Preview from './preview-campaign';

const DynamicMetaTag = dynamic(() => import('@/components/dynamicMetaTag'), {
  ssr: false,
});
const PreviewCampaign: React.FC = () => {
  return (
    <>
      <div className='flex flex-col min-h-[700px] h-[85vh]'>
        <div className='flex-grow-0'>
          <h1 className='font-[600] text-2xl'>Preview campaign</h1>
          <p className='font-[400] text-sm text-[#667185]'>
            See how your campaign will appear to users
          </p>
        </div>
        <Preview />
        <DynamicMetaTag route='Preview campaign' />
      </div>
    </>
  );
};

export default PreviewCampaign;
