import usePayment from '@/hooks/cachedEndpoints/usePayment';
import { formatPrice } from '@/lib/utils';
import { Card, CardBody } from '@nextui-org/react';

const PaymentCard = ({ payments }: any) => {
  const { data } = usePayment();
  return (
    <article className='flex flex-wrap gap-5'>
      <Card className='p-4 lg:w-[300px] w-full'>
        <CardBody className='flex-col items-start'>
          <p className='text-[14px] text-grey500 font-[600] pb-2'>
            Total payment
          </p>

          <h4 className='font-bold text-[20px] '>
            {data?.totalPayment
              ? formatPrice(data?.totalPayment)
              : formatPrice(0)}
          </h4>
        </CardBody>
      </Card>
      <Card className='p-4 lg:w-[300px] w-full'>
        <CardBody className=' flex-col items-start'>
          <p className='text-[14px] text-grey500 font-[600] pb-2'>
            Confirmed payments
          </p>

          <h4 className='font-bold text-[20px]'>
            {data?.confirmedPayment
              ? formatPrice(data?.confirmedPayment)
              : formatPrice(0)}
          </h4>
        </CardBody>
      </Card>
      <Card className='p-4 lg:w-[300px] w-full'>
        <CardBody className='flex-col items-start'>
          <p className='text-[14px] text-grey500 font-[600] pb-2'>
            Pending payments
          </p>

          <h4 className='font-bold text-[20px]'>
            {data?.pendingPayment
              ? formatPrice(data?.pendingPayment)
              : formatPrice(0)}
          </h4>
        </CardBody>
      </Card>
    </article>
  );
};

export default PaymentCard;
