import { logout } from '@/app/api/controllers/dashboard/settings';
import { notify, removeCookie } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutFn = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await logout();
      const isSuccessful = response?.data?.isSuccessful;

      if (isSuccessful) {
        queryClient.clear();
        localStorage.clear();
        removeCookie('token');
        router.push('/auth/login');
      } else {
        notify({
          title: 'Error!',
          text: 'An error occurred, please try again',
          type: 'error',
        });
      }

      return isSuccessful;
    } catch (error) {
      notify({
        title: 'Error!',
        text: 'An error occurred, please try again',
        type: 'error',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router, queryClient]);

  return { isLoading, logoutFn };
};

export default useLogout;
