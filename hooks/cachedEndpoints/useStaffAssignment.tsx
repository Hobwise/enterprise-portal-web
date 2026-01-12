'use client';
import { getStaffAssignments } from '@/app/api/controllers/auth';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface StaffAssignment {
  id: string;
  name: string;
}

const useStaffAssignment = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const fetchStaffAssignments = async () => {
    const responseData = await getStaffAssignments(
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as StaffAssignment[];
  };

  const { data, isLoading, isError, refetch } = useQuery<StaffAssignment[]>({
    queryKey: ['staffAssignments'],
    queryFn: fetchStaffAssignments,
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, isError, refetch };
};

export default useStaffAssignment;