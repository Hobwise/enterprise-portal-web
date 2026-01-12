'use client';

import { getFile } from '@/app/api/controllers/dashboard/settings';
import { useQuery } from '@tanstack/react-query';

interface UseGetFileProps {
  imageRef: string;
}

const useGetFile = ({ imageRef }: UseGetFileProps) => {
  const retrieveFile = async () => {
    const responseData = await getFile(imageRef);

    return responseData?.data;
  };

  const { data, refetch, isLoading, isError } = useQuery<any>({
    queryKey: ['getFile', imageRef],
    queryFn: retrieveFile,
    
      enabled: !!imageRef,
      refetchOnWindowFocus: false,
    
  });

  return { data, isLoading, isError, refetch };
};

export default useGetFile;
