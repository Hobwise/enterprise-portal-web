"use client";

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Divider,
} from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import { X } from 'lucide-react';

// Types
interface OrderDetailItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDetailData {
  id: string;
  table: string;
  orderNumber: string;
  servedBy: string;
  restaurantName?: string;
  restaurantLocation?: string;
  items: OrderDetailItem[];
  subtotal: number;
  packingCost: number;
  tax: number;
  grandTotal: number;
  dateCreated?: string;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderData: OrderDetailData | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onOpenChange,
  orderData,
}) => {
  if (!orderData) return null;

  const itemCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
              <div className="flex justify-center items-center">
                <div className="flex-1 flex justify-center items-center flex-col">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {orderData.restaurantName || 'Cubana Restaurant and Grills'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {orderData.restaurantLocation || 'Tafawa Balewa Way, Ikeja, Lagos'}
                  </p>
                </div>
             
              </div>
            </ModalHeader>

            <ModalBody className="px-6 pb-6">
              {/* Order Info */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">{orderData.table}</span>
                  <span className="text-sm text-gray-500">{itemCount} items selected</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Served By</span>
                  <span className="text-sm text-gray-900">{orderData.servedBy}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Number</span>
                  <span className="text-sm text-gray-900">{orderData.orderNumber}</span>
                </div>
              </div>

            

              {/* Order Items */}
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start border-b pb-1">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.itemName}</h4>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-sm text-gray-600">{item.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>


              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-sm text-gray-900">{formatPrice(orderData.subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Packing Cost</span>
                  <span className="text-sm text-gray-900">{formatPrice(orderData.packingCost)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm text-gray-900">{formatPrice(orderData.tax)}</span>
                </div>

                <Divider className="" />

                <div className="flex justify-center flex-col items-center pt-2">
                  <span className="text-sm font-semibold text-gray-700">Grand Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(orderData.grandTotal)}
                  </span>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OrderDetailModal;
