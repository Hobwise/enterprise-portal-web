import { formatPrice } from '@/lib/utils';
import { Card, CardBody } from '@nextui-org/react';
import React from 'react';

const PaymentCard = ({ payments }: any) => {
  return (
    <article className='flex flex-wrap gap-5'>
      <Card className='p-4 lg:w-[300px] w-full'>
        <CardBody className='flex-col items-start'>
          <p className='text-[14px] text-grey500 font-[600] pb-2'>
            Total payment
          </p>

          <h4 className='font-bold text-[20px] '>
            {formatPrice(payments[0]?.totalAmount)}
          </h4>
        </CardBody>
      </Card>
      <Card className='p-4 lg:w-[300px] w-full'>
        <CardBody className=' flex-col items-start'>
          <p className='text-[14px] text-grey500 font-[600] pb-2'>
            Confirmed payments
          </p>

          <h4 className='font-bold text-[20px]'>
            {formatPrice(payments[1]?.totalAmount)}
          </h4>
        </CardBody>
      </Card>
      <Card className='p-4 lg:w-[300px] w-full'>
        <CardBody className='flex-col items-start'>
          <p className='text-[14px] text-grey500 font-[600] pb-2'>
            Pending payments
          </p>

          <h4 className='font-bold text-[20px]'>
            {formatPrice(payments[2]?.totalAmount)}
          </h4>
        </CardBody>
      </Card>
    </article>
  );
};

export default PaymentCard;
