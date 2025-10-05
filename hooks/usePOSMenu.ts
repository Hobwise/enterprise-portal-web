import { useState, useEffect } from 'react';
import { getPOSMenu, POSSection } from '@/app/api/controllers/pos';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';

export const usePOSMenu = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posData, setPosData] = useState<POSSection[]>([]);

  const fetchPOSMenuData = async () => {
    setLoading(true);
    setError(null);
    try {
      const businesses = getJsonItemFromLocalStorage('business');
      const businessId = businesses?.[0]?.businessId;

      const response = await getPOSMenu(businessId);

      if (response?.data) {
        const menuData = response.data;

        if (menuData.isSuccessful && menuData.data) {
          setPosData(menuData.data);
        } else if (menuData.data) {
          setPosData(menuData.data);
        } else {
          setError('Failed to load menu data');
          notify({
            title: 'Error',
            text: 'Failed to load menu data',
            type: 'error'
          });
        }
      } else {
        setError('No menu data available');
        notify({
          title: 'Error',
          text: 'No menu data available',
          type: 'error'
        });
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while loading menu');
      notify({
        title: 'Error',
        text: err?.message || 'An error occurred while loading menu',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSMenuData();
  }, []);

  return { loading, error, posData, refetch: fetchPOSMenuData };
};
