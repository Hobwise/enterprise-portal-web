'use client';
import { getPaymentByBusiness, getPaymentDetails } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

interface PaymentItem {
  id: string;
  qrName: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  dateCreated: string;
  customer: string;
  status: number;
  paymentReference: string;
}

interface PaymentCategory {
  name: string;
  totalCount: number;
  payments: PaymentItem[];
}

const usePayment = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllPayments = async ({ queryKey }: { queryKey: any }) => {
    const [
      _key,
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ] = queryKey;

    try {
      // Fetch payment categories
      const categoriesResponse = await getPaymentByBusiness(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        tableStatus,
        filterType,
        startDate,
        endDate
      );
      const categories = categoriesResponse?.data|| [];
      const detail = categoriesResponse?.data.data.paymentCategories|| [];
  
      
      if (categories.length === 0) {
        return { categories: [], details: [] };
      }
      // Fetch details for the selected category or first category
      const targetCategory = tableStatus || detail[0]?.name;
      const detailsItems = await getPaymentDetails(
        businessInformation[0]?.businessId,
        targetCategory,
        filterType,
        startDate,
        endDate,
        page,
        rowsPerPage
      );
      return {
        categories,
        details: detailsItems,
      };
    } catch (error) {
      return { categories: [], details: [] };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      "payments",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    queryFn: getAllPayments,
    
      ...fetchQueryConfig(options),
      refetchOnWindowFocus: false,
      staleTime: 0,
      enabled: options?.enabled !== false,
    
  });

  return {
    categories: data?.categories || [],
    details: data?.details || [],
    isLoading,
    isError,
    refetch,
  };
};

export default usePayment;