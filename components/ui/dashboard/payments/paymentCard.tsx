import { formatPrice } from '@/lib/utils';

const PaymentCard = ({ data }: any) => {
  return (
    <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible lg:grid-cols-4 gap-3 lg:gap-4 mb-6 pb-2 snap-x snap-mandatory lg:snap-none">
      {data?.map((item: any, idx: any) => (
        <div
          key={idx}
          className="relative rounded-lg p-4 lg:p-6 cursor-pointer transition-all duration-300 min-w-[200px] lg:min-w-0 flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none bg-white border border-gray-200 text-gray-900 hover:shadow-md hover:scale-102"
        >
          <div className="space-y-1 lg:space-y-2">
            <h3 className="text-xs lg:text-sm font-semibold uppercase tracking-wide text-gray-600">
              {item.name}
            </h3>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {formatPrice(item.totalAmount, 'NGN')}
            </div>
            {item.count !== undefined && (
              <p className="text-xs lg:text-sm text-gray-500">
                {item.count} {item.count === 1 ? 'payment' : 'payments'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentCard;
