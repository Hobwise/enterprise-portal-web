"use client";

import React from "react";
import { Button, Divider, Spacer } from "@nextui-org/react";
// Removed Next.js Image import - using regular img tag for static assets
import { FaMinus, FaPlus } from "react-icons/fa6";
import { formatPrice } from "@/lib/utils";
// Use direct path for Next.js static assets
const noMenu = "/assets/images/no-menu.png";
import { SelectedSkeletonLoading } from "./place-order/data";

type Item = {
  id: string;
  itemID: string;
  itemName: string;
  menuName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image: string;
  isVariety: boolean;
  varieties: null | any;
  count: number;
  packingCost: number;
  isPacked?: boolean;
};

interface OrderCartSidebarProps {
  selectedItems: Item[];
  businessName?: string;
  loading?: boolean;
  isUpdating?: boolean;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onItemClick?: (item: Item, isPacked: boolean) => void;
  calculateTotalPrice: () => number;
  className?: string;
}

const OrderCartSidebar: React.FC<OrderCartSidebarProps> = ({
  selectedItems,
  businessName = 'Business Name',
  loading = false,
  isUpdating = false,
  onIncrement,
  onDecrement,
  onItemClick,
  calculateTotalPrice,
  className = "hidden xl:grid xl:flex-col p-4 rounded-lg w-[600px] h-full"
}) => {
  const totalItems = selectedItems.reduce((total, item) => total + item.count, 0);

  return (
    <article className={className}>
      {selectedItems.length > 0 ? (
        <>
          {/* Business Name Header */}
          <div className="mb-4">
            <h1 className="text-lg font-[700] text-gray-800">
              {businessName}
            </h1>
          </div>
          
          {/* Cart Items - Scrollable */}
          <div className="flex-1 h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="">Table</div>
              <h2 className="font-[600] mb-2">
                {totalItems} Item{totalItems !== 1 ? 's' : ''} 
              </h2>
            </div>
            <div className="rounded-lg">
              {selectedItems?.map((item, index) => {
                return (
                  <React.Fragment key={item.id}>
                    <div
                      className="flex py-3 justify-between items-center cursor-pointer"
                      onDoubleClick={() => onItemClick?.(item, item.isPacked || false)}
                    >
                      <div className="rounded-lg w-28 text-black flex">
                        <div className="ml-3 flex flex-col text-sm justify-center">
                          <p className="font-[500] text-base text-[#344054]">{item.itemName}</p>
                          <Spacer y={1} />
                          <p className="text-[#475367] text-sm">{item.menuName}</p>
                        </div>
                      </div>
                      <div className="flex w-24 items-center">
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
                        <span className="font-bold py-2 px-4">
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
                      <p className="font-medium text-sm text-[#344054]">
                        {formatPrice(item?.price * item.count)}
                      </p>
                    </div>
                    {index !== selectedItems?.length - 1 && (
                      <Divider className="bg-[#E4E7EC80]" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Sticky Pricing Section */}
          <div className="sticky bottom-0 pb-4 bg-white pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-[13px] font-[500]">Subtotal</h3>
                <p className="text-[14px] font-[600]">
                  {formatPrice(calculateTotalPrice())}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-[13px] font-[500] text-gray-600">VAT (7.5%)</h3>
                <p className="text-[14px] font-[500] text-gray-600">
                  {formatPrice(calculateTotalPrice() * 0.075)}
                </p>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <h3 className="text-[14px] font-[600]">Total</h3>
                <p className="text-[16px] font-[700] text-primaryColor">
                  {formatPrice(calculateTotalPrice() * 1.075)}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {loading ? (
            <SelectedSkeletonLoading />
          ) : (
            <div className="flex flex-col h-[60vh] rounded-xl justify-center items-center">
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[50px] h-[50px]"
                  src={noMenu}
                  alt="no menu illustration"
                />
                <Spacer y={3} />
                <p className="text-sm">
                  Selected menu(s) will appear here
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </article>
  );
};

export default OrderCartSidebar;