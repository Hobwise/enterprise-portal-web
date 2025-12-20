import { formatPrice } from "@/lib/utils";

interface PaymentCardProps {
  data: any;
  tableStatus: string;
  onStatusChange: (status: string) => void;
  onPageReset: () => void;
}

const PaymentCard = ({
  data,
  tableStatus,
  onStatusChange,
  onPageReset,
}: PaymentCardProps) => {
  return (
    <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible lg:grid-cols-3 gap-3 lg:gap-4 mb-6 pb-2 snap-x snap-mandatory lg:snap-none">
      {data?.map((item: any, idx: any) => {
        const isActive =
          tableStatus === item.name || (!tableStatus && item.name === "All");
        return (
          <div
            key={idx}
            onClick={() => {
              onStatusChange(item.name);
              onPageReset();
            }}
            className={`
              relative rounded-lg p-4 lg:p-6 cursor-pointer transition-all duration-300
              min-w-[200px] lg:min-w-0 flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none
              ${
                isActive
                  ? "bg-gradient-to-br from-primaryColor to-secondaryColor text-white shadow-lg scale-105"
                  : "bg-white border border-gray-200 text-gray-900 hover:shadow-md hover:scale-102"
              }
            `}
          >
            <div className="space-y-1 lg:space-y-2">
              <h3
                className={`text-xs lg:text-sm font-semibold uppercase tracking-wide ${
                  isActive ? "text-white/90" : "text-gray-500"
                }`}
              >
                {item.name}
              </h3>
              <div
                className={`text-xl lg:text-2xl font-bold ${
                  isActive ? "text-white" : "text-gray-900"
                }`}
              >
                {formatPrice(item.totalAmount, "NGN")}
              </div>
              {item.count !== undefined && (
                <p
                  className={`text-xs lg:text-sm ${
                    isActive ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {item.count} {item.count === 1 ? "payment" : "payments"}
                </p>
              )}
            </div>
            {isActive && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PaymentCard;
