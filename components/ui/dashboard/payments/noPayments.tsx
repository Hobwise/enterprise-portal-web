import React from 'react';
import Image from 'next/image';
import NoPayment from '../../../../public/assets/images/no-payment.png';

import { Spacer } from '@nextui-org/react';

const NoPaymentsScreen = () => {
  return (
    <section>
      <Spacer y={14} />
      <div className='flex flex-col items-center'>
        <Image src={NoPayment} alt='no order illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>You have no payments yet</p>
        <p className='text-sm font-[400] xl:w-[250px] w-full text-center text-[#475367]'>
          Payments will appear here when you start making sales
        </p>
      </div>
    </section>
  );
};

export default NoPaymentsScreen;
