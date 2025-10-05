import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button, Divider, Spacer } from '@nextui-org/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { formatPrice } from '@/lib/utils';
import { Item, OrderSummary } from '@/app/pos/types';
import noMenu from '@/public/assets/images/no-menu.png';

interface OrderSummaryPanelProps {
  orderItems: Item[];
  orderSummary: OrderSummary;
  businessName?: string;
  businessAddress?: string;
  staffName?: string;
  isUpdating: boolean;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClearCart: () => void;
  onProcessOrder: () => void;
}

export const OrderSummaryPanel: React.FC<OrderSummaryPanelProps> = ({
  orderItems,
  orderSummary,
  businessName,
  businessAddress,
  staffName,
  isUpdating,
  onIncrement,
  onDecrement,
  onClearCart,
  onProcessOrder,
}) => {
  return (
    <div className="hidden lg:flex w-96 bg-white shadow flex-col relative h-full">
      {/* Business Name Header */}
      <div className="px-6 py-2">
        <h3 className="text-lg text-center font-semibold text-gray-900">
          {businessName || 'Business Name'}
        </h3>
        <p className="text-sm text-center text-gray-500">
          {businessAddress || 'Business Address'}
        </p>
      </div>

     {orderItems.length > 0 && (
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">POS Terminal</div>
            <div className="text-gray-500">Served By</div>
            <div className="font-medium">{staffName || 'Staff'}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500">{orderSummary.itemCount} items selected</div>
            <div className="text-gray-500">Order Type</div>
            <div className="font-medium">POS</div>
          </div>
        </div>
      </div>

     )}

      {orderItems.length > 0 ? (
        <>
          {/* Cart Items - Scrollable */}
          <div className="flex-1 px-6 pt-6 pb-10 overflow-y-auto">
         
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900">
                        {item.itemName}
                      </h4>
                      <p className="text-xs text-gray-500">{item.menuName}</p>
                      {item.isPacked && (
                        <p className="text-xs text-blue-600">+ Packing</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onPress={() => onDecrement(item.id)}
                        isIconOnly
                        radius="sm"
                        size="sm"
                        variant="faded"
                        className="border border-[#EFEFEF]"
                        aria-label="minus"
                        isDisabled={isUpdating}
                      >
                        <FaMinus />
                      </Button>
                      <span className="w-8 text-center text-sm font-bold">
                        {item.count}
                      </span>
                      <Button
                        onPress={() => onIncrement(item.id)}
                        isIconOnly
                        radius="sm"
                        size="sm"
                        variant="faded"
                        className="border border-[#EFEFEF]"
                        aria-label="plus"
                        isDisabled={isUpdating}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.count, item.currency)}
                      </div>
                    </div>
                  </div>
                  {index !== orderItems.length - 1 && (
                    <Divider className="bg-[#E4E7EC80]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Sticky Pricing Section */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(orderSummary.subtotal, orderItems[0]?.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%)</span>
                <span>{formatPrice(orderSummary.vatAmount)}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span className="text-primaryColor">{formatPrice(orderSummary.total)}</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClearCart}
                className="flex-1 flex items-center justify-center space-x-2 py-3 border border-[#6D42E2] text-[#6D42E2] rounded-md hover:bg-red-50 text-sm transition-colors"
              >
                <X className="w-4 h-4 text-[#6D42E2]" />
                <span>Clear Cart</span>
              </button>
              <button
                onClick={onProcessOrder}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#6D42E2] text-white rounded-md text-sm transition-all duration-200"
              >
                <span>Process Order</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full justify-center items-center p-6">
          <div className="flex flex-col justify-center items-center">
            <Image
              className="w-[50px] h-[50px]"
              src={noMenu}
              alt="no menu illustration"
            />
            <Spacer y={3} />
            <p className="text-sm text-center">
              Selected items will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
