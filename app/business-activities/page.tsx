"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/dashboard/header';
import OrderDetailModal, { OrderDetailData } from '@/components/ui/dashboard/orders/OrderDetailModal';

// Types
interface Order {
  name: string;
  category: string;
  quantity: number;
}

interface OrderCardProps {
  table: string;
  time: string;
  timeColor: string;
  orders: Order[];
  comment?: string;
  orderNumber: string;
  onCardClick?: () => void;
}

interface SwipeableOrderItemProps {
  order: Order;
  idx: number;
}

const SwipeableOrderItem: React.FC<SwipeableOrderItemProps> = ({ order }) => {
  return (
    <div className="border-b border-gray-100 last:border-0 py-2 flex justify-between items-start">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{order.name}</div>
        <div className="text-xs text-gray-500">{order.category}</div>
      </div>
      <div className="text-gray-900 font-medium ml-4">{order.quantity}</div>
    </div>
  );
};

const OrderCard: React.FC<OrderCardProps> = ({ table, time, timeColor, orders, comment, onCardClick }) => {
  const [swipeX, setSwipeX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX - swipeX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const x = clientX - startX;
    const maxSwipe = 280;
    const minSwipe = -280;
    setSwipeX(Math.max(minSwipe, Math.min(maxSwipe, x)));
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (swipeX > 140) {
      setSwipeX(280);
    } else if (swipeX < -140) {
      setSwipeX(-280);
    } else {
      setSwipeX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.time-buttons')) return;
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleMouseUp = () => handleEnd();

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.time-buttons')) return;
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX]);

  return (
    <div className="relative h-auto min-w-[280px]">
      {/* Action Buttons Background */}
      <div className="absolute inset-0 flex rounded-lg overflow-hidden">
        <div className="h-full w-1/2 bg-green-500 flex flex-col items-center justify-center gap-2">
          <Check className="w-8 h-8 text-white" />
          <span className="text-white font-semibold text-sm">Complete</span>
        </div>
        <div className=" h-full w-1/2 bg-red-500 flex flex-col items-center justify-center gap-2">
          <X className="w-8 h-8 text-white" />
          <span className="text-white font-semibold text-sm">Cancel</span>
        </div>
      </div>

      {/* Swipeable Card */}
      <div
        ref={containerRef}
        className={`relative bg-white rounded-lg shadow-sm overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } transition-transform ${isDragging ? '' : 'duration-300 ease-out'}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`${timeColor} text-white px-4 py-3 flex justify-between items-center cursor-pointer`}
          onClick={onCardClick}
        >
          <span className="font-semibold">{table}</span>
          <span className="font-bold text-lg">{time}</span>
        </div>

        <div className="p-4 space-y-3" onClick={onCardClick}>
          {orders.map((order, idx) => (
            <SwipeableOrderItem key={idx} order={order} idx={idx} />
          ))}

          {comment && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">COMMENT</div>
              <div className="text-sm text-blue-900">{comment}</div>
            </div>
          )}
        </div>
        
        <div className="flex border-t border-gray-200 time-buttons">
          <button className="flex-1 py-3 text-center text-primaryColor hover:bg-pink200 transition-colors text-sm font-medium">
            +5mins
          </button>
          <button className="flex-1 py-3 text-center text-primaryColor hover:bg-pink200 transition-colors text-sm font-medium border-l border-r border-gray-200">
            +10mins
          </button>
          <button className="flex-1 py-3 text-center text-primaryColor hover:bg-pink200 transition-colors text-sm font-medium">
            +15mins
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RestaurantOrders() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);

  const ordersData = [
    {
      table: 'Table 9',
      time: '10:28',
      timeColor: 'bg-green-400',
      orderNumber: '#99822',
      servedBy: 'Jane Doe',
      orders: [
        { name: 'Ribeye Steak', category: 'Grills', quantity: 1 },
        { name: 'Chicken Shawarma', category: 'Pasteries', quantity: 1 },
        { name: 'Stir Fried Pasta', category: 'Pasta', quantity: 1 },
        { name: 'Spaghetti Bolognese', category: 'Pasta', quantity: 1 },
        { name: 'Asun Pasta', category: 'Pasta', quantity: 1 }
      ],
      comment: 'MAKE THE ASUN PASTA VERY SPICY EVERY OTHER ITEM CAN BE MILD'
    },
    {
      table: 'Table 5',
      time: '02:22',
      timeColor: 'bg-red-400',
      orderNumber: '#99823',
      servedBy: 'Jane Doe',
      orders: [
        { name: 'Ribeye Steak', category: 'Grills', quantity: 1 },
        { name: 'Chicken Shawarma', category: 'Pasteries', quantity: 1 },
        { name: 'Stir Fried Pasta', category: 'Pasta', quantity: 1 },
        { name: 'Spaghetti Bolognese', category: 'Pasta', quantity: 1 },
        { name: 'Asun Pasta', category: 'Pasta', quantity: 1 }
      ]
    },
    {
      table: 'Table 10',
      time: '7:43',
      timeColor: 'bg-green-500',
      orderNumber: '#99824',
      servedBy: 'Jane Doe',
      orders: [
        { name: 'Ribeye Steak', category: 'Grills', quantity: 1 },
        { name: 'Chicken Shawarma', category: 'Pasteries', quantity: 1 },
        { name: 'Stir Fried Pasta', category: 'Pasta', quantity: 1 },
        { name: 'Spaghetti Bolognese', category: 'Pasta', quantity: 1 },
        { name: 'Asun Pasta', category: 'Pasta', quantity: 1 }
      ]
    },
    {
      table: 'Table 7',
      time: '12:06',
      timeColor: 'bg-green-400',
      orderNumber: '#99825',
      servedBy: 'Jane Doe',
      orders: [
        { name: 'Ribeye Steak', category: 'Grills', quantity: 1 },
        { name: 'Chicken Shawarma', category: 'Pasteries', quantity: 1 },
        { name: 'Stir Fried Pasta', category: 'Pasta', quantity: 1 },
        { name: 'Spaghetti Bolognese', category: 'Pasta', quantity: 1 },
        { name: 'Asun Pasta', category: 'Pasta', quantity: 1 }
      ],
      comment: 'MAKE THE ASUN PASTA VERY SPICY EVERY OTHER ITEM CAN BE MILD'
    },
    {
      table: 'Table 4',
      time: '10:28',
      timeColor: 'bg-green-400',
      orderNumber: '#99826',
      servedBy: 'Jane Doe',
      orders: [
        { name: 'Ribeye Steak', category: 'Grills', quantity: 1 },
        { name: 'Chicken Shawarma', category: 'Pasteries', quantity: 1 },
        { name: 'Stir Fried Pasta', category: 'Pasta', quantity: 1 },
        { name: 'Spaghetti Bolognese', category: 'Pasta', quantity: 1 },
        { name: 'Asun Pasta', category: 'Pasta', quantity: 1 }
      ]
    }
  ];

  const handleOrderClick = (order: typeof ordersData[0]) => {
    // Convert order data to modal format
    const modalData: OrderDetailData = {
      id: order.orderNumber,
      table: order.table,
      orderNumber: order.orderNumber,
      servedBy: order.servedBy,
      items: order.orders.map((item, idx) => ({
        id: `${order.orderNumber}-${idx}`,
        itemName: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.category === 'Wine' ? 250000 : item.category === 'Water' ? 3000 : item.category === 'Fresh Juice' ? 5000 : item.category === 'Soda' ? 4500 : item.category === 'Pasta' ? 5000 : item.category === 'Tequila' ? 525000 : item.category === 'Grills' ? 15000 : 8000,
        totalPrice: item.quantity * (item.category === 'Wine' ? 250000 : item.category === 'Water' ? 3000 : item.category === 'Fresh Juice' ? 5000 : item.category === 'Soda' ? 4500 : item.category === 'Pasta' ? 5000 : item.category === 'Tequila' ? 525000 : item.category === 'Grills' ? 15000 : 8000),
      })),
      subtotal: 0,
      packingCost: 2500,
      tax: 2500,
      grandTotal: 0,
    };

    // Calculate totals
    modalData.subtotal = modalData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    modalData.grandTotal = modalData.subtotal + modalData.packingCost + modalData.tax;

    setSelectedOrder(modalData);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header */}
      <Header ispos />

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
            <p className="text-sm text-gray-500">Show all open orders at the bar</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/business-activities/order-list')}
              className="px-4 py-2 border border-primaryColor text-primaryColor rounded-lg hover:bg-pink200 transition-colors flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              Order list
            </button>
            {/* <button className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors flex items-center gap-2">
              Active Orders
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button> */}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {ordersData.map((order, idx) => (
            <OrderCard
              key={idx}
              {...order}
              onCardClick={() => handleOrderClick(order)}
            />
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        orderData={selectedOrder}
      />
    </div>
  );
}