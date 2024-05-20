'use client';
import { getPaymentByBusiness } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Payment {
  id: string;
  customer: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  orderID: string;
  qrName: string;
  paymentMethod: number;
  paymentReference: string;
  status: number;
  dateCreated: string;
  cooperateID: string;
  businessID: string;
}

interface OrderSummary {
  name: string;
  totalAmount: number;
  payments: Payment[];
}

const usePayment = () => {
  const [payments, setPayments] = useState<OrderSummary[]>([]);

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [error, setError] = useState<Boolean>(false);
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllPayments = async (checkLoading = true) => {
    setIsLoading(checkLoading);
    setError(false);
    const data = await getPaymentByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;

      setPayments(response);
    } else if (data?.data?.error) {
      setError(true);
    }
  };

  useEffect(() => {
    getAllPayments();
  }, []);
  return { payments, error, isLoading, getAllPayments };
};

export default usePayment;
