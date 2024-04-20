import React from 'react';
import Image from 'next/image';
import NoOrder from '../../../../public/assets/images/no-order.png';

import { Spacer } from '@nextui-org/react';

const CreateOrder = ({ onOpen }: any) => {
  return (
    <section>
      <Spacer y={14} />
      <div className='flex flex-col items-center'>
        <Image src={NoOrder} alt='no order illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>You have no order yet</p>
        <p className='text-sm font-[400] xl:w-[200px] w-full text-center text-[#475367]'>
          Orders will appear here when customers make a request.
        </p>
      </div>
    </section>
  );
};

export default CreateOrder;
