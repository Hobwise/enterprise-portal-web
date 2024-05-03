import Container from '@/components/dashboardContainer';
import Image from 'next/image';
import React from 'react';
import hobink from '../../../../public/assets/images/hobink.png';

const LoadingSpinner = () => {
  return (
    <Container>
      <div
        className={`loadingContainer bg-white flex flex-col justify-center items-center`}
      >
        <div className='animate-bounce'>
          <Image
            src={hobink}
            style={{ objectFit: 'cover' }}
            alt='hobink logo'
          />
        </div>
        <p className='text-center loading-text text-primaryColor'>Loading...</p>
      </div>
    </Container>
  );
};

export default LoadingSpinner;
