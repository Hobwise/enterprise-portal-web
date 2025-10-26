"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/dashboard/header';
import OrderDetailModal, { OrderDetailData } from '@/components/ui/dashboard/orders/OrderDetailModal';
import { getActiveOrdersByCategory, getOrderDetailsByCategory, completeOrder, updateEstimatedPreparationTime } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import moment from 'moment';
import { Spinner } from '@nextui-org/react';
import { CustomLoading } from '@/components/ui/dashboard/CustomLoading';
import Error from '@/components/error';

// Types matching API response
interface OrderDetail {
  itemName: string;
  menuName: string;
  quantity: number;
  totalPrice: number;
  status: number;
  dateUpdated: string;
}

interface ActiveOrder {
  orderId: string;
  reference: string;
  placedByName: string;
  placedByPhoneNumber: string;
  tableName: string;
  estimatedCompletionTime: string;
  comment: string;
  details: OrderDetail[];
}

interface ActiveOrdersResponse {
  data: ActiveOrder[];
  error: any;
  isSuccessful: boolean;
}

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
  orderId: string;
  categoryId: string;
  businessId: string;
  onCardClick?: () => void;
  onComplete?: () => void;
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

const OrderCard: React.FC<OrderCardProps> = ({ table, time, timeColor, orders, comment, orderNumber, orderId, categoryId, businessId, onCardClick, onComplete }) => {
  const [swipeY, setSwipeY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isUpdatingTime, setIsUpdatingTime] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY - swipeY);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const y = clientY - startY;
    // Only allow upward swipe (negative values)
    const minSwipe = -280;
    const maxSwipe = 0;
    setSwipeY(Math.max(minSwipe, Math.min(maxSwipe, y)));
  };

  const handleEnd = async () => {
    const currentSwipeY = swipeY;
    setIsDragging(false);
    // If swiped up more than 140px, trigger complete
    if (currentSwipeY < -140) {
      setSwipeY(-280);
      await handleComplete();
    } else {
      setSwipeY(0);
    }
  };

  const handleComplete = useCallback(async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      const response = await completeOrder(categoryId, orderId);

      if ((response as any)?.isSuccessful || response?.data) {
        notify({
          title: "Success",
          text: "Order marked as complete",
          type: "success",
        });

        // Reset swipe and delay refresh to allow backend to process
        setSwipeY(0);

        // Delay refresh to allow backend to process the completion
        // This prevents fetching stale data due to race condition
        console.log('⏳ Waiting 1.5s before refreshing to ensure order is marked complete');
        setTimeout(() => {
          console.log('🔄 Refreshing orders after completion');
          if (onComplete) {
            onComplete();
          }
        }, 1500);
      } else {
        notify({
          title: "Error",
          text: "Failed to complete order",
          type: "error",
        });
        setSwipeY(0);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      notify({
        title: "Error",
        text: "Failed to complete order",
        type: "error",
      });
      setSwipeY(0);
    } finally {
      setIsCompleting(false);
    }
  }, [isCompleting, categoryId, orderId, onComplete]);

  const handleAddTime = async (additionalMins: number) => {
    if (isUpdatingTime) return;

    // Validate businessId exists
    if (!businessId) {
      notify({
        title: "Error",
        text: "Business information not found. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setIsUpdatingTime(true);
    try {
      console.log('🔵 Adding time to specific order:', {
        orderId,
        table,
        orderNumber,
        additionalMins,
        businessId
      });

      const response = await updateEstimatedPreparationTime(orderId, businessId, additionalMins);

      console.log('✅ API Response for orderId', orderId, ':', response);

      if ((response as any)?.isSuccessful || response?.data) {
        notify({
          title: "Success",
          text: `Added ${additionalMins} minutes to ${table}`,
          type: "success",
        });

        // Delay refresh to allow backend to process the update
        // This prevents fetching stale data due to race condition
        console.log('⏳ Waiting 1.5s before refreshing to ensure backend is updated');
        setTimeout(() => {
          console.log('🔄 Refreshing orders to show updated time');
          if (onComplete) {
            onComplete();
          }
        }, 1500);
      } else {
        console.error('❌ Update preparation time failed for orderId', orderId, ':', response);
        notify({
          title: "Error",
          text: "Failed to update preparation time",
          type: "error",
        });
      }
    } catch (error) {
      console.error('❌ Error updating preparation time for orderId', orderId, ':', error);
      notify({
        title: "Error",
        text: "Failed to update preparation time",
        type: "error",
      });
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.time-buttons')) return;
    handleStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.time-buttons')) return;
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleEnd();

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        const y = e.clientY - startY;
        const minSwipe = -280;
        const maxSwipe = 0;
        setSwipeY(Math.max(minSwipe, Math.min(maxSwipe, y)));
      };

      const handleMouseUp = async () => {
        const currentSwipeY = swipeY;
        setIsDragging(false);
        if (currentSwipeY < -140) {
          setSwipeY(-280);
          await handleComplete();
        } else {
          setSwipeY(0);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, swipeY, handleComplete]);

  return (
    <div className="relative h-auto w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
      {/* Complete Action Background (Bottom) */}
      <div className="absolute inset-0 flex items-end rounded-lg overflow-hidden">
        <div className="w-full h-full bg-primaryColor flex flex-col items-center justify-center gap-2">
          <Check className="w-8 h-8 text-white" />
          <span className="text-white font-semibold text-sm">
            {isCompleting ? 'Completing...' : 'Complete Order'}
          </span>
        </div>
      </div>

      {/* Swipeable Card */}
      <div
        ref={containerRef}
        className={`relative bg-white rounded-lg shadow-sm overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } transition-transform ${isDragging ? '' : 'duration-300 ease-out'}`}
        style={{ transform: `translateY(${swipeY}px)` }}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddTime(5);
            }}
            disabled={isUpdatingTime}
            className={`flex-1 py-3 text-center text-primaryColor hover:bg-pink200 transition-colors text-sm font-medium ${
              isUpdatingTime ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUpdatingTime ? 'Updating...' : '+5mins'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddTime(10);
            }}
            disabled={isUpdatingTime}
            className={`flex-1 py-3 text-center text-primaryColor hover:bg-pink200 transition-colors text-sm font-medium border-l border-r border-gray-200 ${
              isUpdatingTime ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUpdatingTime ? 'Updating...' : '+10mins'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddTime(15);
            }}
            disabled={isUpdatingTime}
            className={`flex-1 py-3 text-center text-primaryColor hover:bg-pink200 transition-colors text-sm font-medium ${
              isUpdatingTime ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUpdatingTime ? 'Updating...' : '+15mins'}
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
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [businessId, setBusinessId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate time color based on estimated completion time
  const getTimeColor = (estimatedCompletionTime: string): string => {
    // Use currentTime to trigger recalculation when state updates
    const now = moment(currentTime);
    const completionTime = moment(estimatedCompletionTime);
    const minutesRemaining = completionTime.diff(now, 'minutes');

    // Red if overdue (negative) or 10 minutes or less remaining
    if (minutesRemaining < 0 || (minutesRemaining >= 0 && minutesRemaining <= 10)) {
      return 'bg-red-400';
    }
    // Green if more than 10 minutes remaining
    return 'bg-green-400';
  };

  // Calculate time display (countdown timer with seconds)
  const getTimeDisplay = (estimatedCompletionTime: string): string => {
    // Use currentTime to trigger recalculation when state updates
    const now = moment(currentTime);
    const completionTime = moment(estimatedCompletionTime);
    const secondsRemaining = completionTime.diff(now, 'seconds');

    // Warn if order is more than 24 hours old (log once per minute)
    const hoursRemaining = completionTime.diff(now, 'hours');
    if (Math.abs(hoursRemaining) > 24 && now.seconds() === 0) {
      console.warn('⚠️ Stale order detected:', {
        estimatedCompletionTime,
        hoursOld: Math.abs(hoursRemaining),
        message: 'This order is more than 24 hours old and should probably not be in active orders'
      });
    }

    // If overdue, show 00:00:00 instead of negative time
    if (secondsRemaining < 0) {
      return '00:00:00';
    }

    // Calculate hours, minutes, seconds for remaining time
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fetch active orders
  const fetchActiveOrders = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setIsError(false);

    try {
      const userInformation = getJsonItemFromLocalStorage("userInformation");
      const business = getJsonItemFromLocalStorage("business");
      const userCategoryId = userInformation?.assignedCategoryId;
      const userBusinessId = business?.[0]?.businessId;

      if (!userCategoryId) {
        setIsError(true);
        if (showLoading) {
          setIsLoading(false);
        }
        return;
      }

      setCategoryId(userCategoryId);
      if (userBusinessId) {
        setBusinessId(userBusinessId);
      }

      const response = await getActiveOrdersByCategory(userCategoryId);

      if ((response as any)?.isSuccessful && response?.data) {
        console.log('✅ Fetched active orders:', {
          count: response.data.length,
          orders: response.data.map((order: ActiveOrder) => ({
            orderId: order.orderId,
            table: order.tableName,
            reference: order.reference,
            estimatedCompletionTime: order.estimatedCompletionTime
          }))
        });
        setActiveOrders(response.data);
      } else {
        console.error('❌ Failed to fetch orders:', response);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error fetching active orders:', error);
      setIsError(true);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Refresh orders without showing loading screen (for background updates)
  const refreshOrders = () => fetchActiveOrders(false);

  useEffect(() => {
    fetchActiveOrders(true); // Show loading on initial load
  }, []);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every 1 second for real-time countdown

    return () => clearInterval(timeInterval);
  }, []);

  // Refresh orders every 5 minutes to get fresh data (without showing loading)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchActiveOrders(false); // Silent background refresh
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const handleOrderClick = async (order: ActiveOrder) => {
    try {
      // Get categoryId from localStorage
      const userInformation = getJsonItemFromLocalStorage("userInformation");
      const categoryId = userInformation?.assignedCategoryId;

      if (!categoryId) {
        notify({
          title: "Error",
          text: "Category information not found",
          type: "error",
        });
        return;
      }

      // Fetch fresh order details from API
      const response = await getOrderDetailsByCategory(categoryId, order.orderId);

      if (!((response as any)?.isSuccessful && response?.data)) {
        notify({
          title: "Error",
          text: "Failed to fetch order details",
          type: "error",
        });
        return;
      }

      // Convert API response to modal format
      const modalData: OrderDetailData = {
        id: order.orderId,
        table: order.tableName,
        orderNumber: order.reference,
        servedBy: order.placedByName,
        items: response.data.map((item: any, idx: number) => ({
          id: `${order.orderId}-${idx}`,
          itemName: item.itemName,
          category: item.menuName,
          quantity: item.quantity,
          unitPrice: item.totalPrice / item.quantity,
          totalPrice: item.totalPrice,
          packingCost: item.packingCost || 0,
        })),
        subtotal: 0,
        packingCost: 0,
        tax: 0,
        grandTotal: 0,
      };

      // Calculate totals
      modalData.subtotal = modalData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      modalData.packingCost = modalData.items.reduce((sum, item) => sum + (item.packingCost || 0), 0);
      modalData.grandTotal = modalData.subtotal + modalData.packingCost + modalData.tax;

      setSelectedOrder(modalData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      notify({
        title: "Error",
        text: "Failed to load order details",
        type: "error",
      });
    }
  };

  // Show loading during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ispos />
        <CustomLoading />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ispos />
        <Error onClick={() => window.location.reload()} />
      </div>
    );
  }

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

        {/* Orders Container */}
        <div className="flex flex-wrap items-start gap-4 pb-4">
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-12">
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 font-medium">No active orders</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here when placed</p>
            </div>
          ) : (
            activeOrders.map((order, idx) => (
              <OrderCard
                key={idx}
                table={order.tableName}
                time={getTimeDisplay(order.estimatedCompletionTime)}
                timeColor={getTimeColor(order.estimatedCompletionTime)}
                orderNumber={order.reference}
                orderId={order.orderId}
                categoryId={categoryId}
                businessId={businessId}
                orders={order.details.map((detail) => ({
                  name: detail.itemName,
                  category: detail.menuName,
                  quantity: detail.quantity,
                }))}
                comment={order.comment || undefined}
                onCardClick={() => handleOrderClick(order)}
                onComplete={refreshOrders}
              />
            ))
          )}
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