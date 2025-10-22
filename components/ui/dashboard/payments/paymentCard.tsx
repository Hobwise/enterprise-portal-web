import { formatPrice } from '@/lib/utils';
import { Card, CardBody } from '@nextui-org/react';

const PaymentCard = ({ data }: any) => {
  <div className=" rounded-md bg-[#F7F6FA] p-6 mb-6 flex flex-row gap-12 items-center">
    {data?.categories?.data?.paymentCategories?.map((item: any, idx: any) => (
      <div className="flex-1" key={idx}>
        <div className="text-grey600 text-base mb-1">{item.name}</div>
        <div className="text-xl font-bold text-black">
          ₦{item.totalAmount.toLocaleString()}
        </div>
      </div>
    ))}
  </div>;

  return (
    <article className="flex flex-wrap gap-5">
      {data?.map((item: any, idx: any) => (
        <Card className="p-4 lg:w-[300px] w-full">
          <CardBody key={idx} className="flex-col items-start">
            <p className="text-[14px] text-grey500 font-[600] pb-2">
              {item.name}
            </p>

            <h4 className="font-bold text-[20px] ">
              ₦{item.totalAmount.toLocaleString()}
            </h4>
          </CardBody>
        </Card>
      ))}
    </article>
  );
};

export default PaymentCard;
