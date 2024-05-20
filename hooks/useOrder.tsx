'use client';
import { getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useEffect, useState } from 'react';

type OrderItem = {
  name: string;
  orders: Array<{
    id: string;
    placedByName: string;
    placedByPhoneNumber: string;
    reference: string;
    treatedBy: string;
    totalAmount: number;
    qrReference: string;
    paymentMethod: number;
    paymentReference: string;
    status: 0 | 1 | 2 | 3;
  }>;
};

type OrderData = Array<OrderItem>;
const useOrder = () => {
  const [orders, setOrders] = useState<OrderData>([]);

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [error, setError] = useState<Boolean>(false);
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllOrders = async (checkLoading = true) => {
    setIsLoading(checkLoading);
    setError(false);
    const data = await getOrderByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      setOrders(response);
    } else if (data?.data?.error) {
      setError(true);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  return { orders, isLoading, error, getAllOrders };
};

export default useOrder;
