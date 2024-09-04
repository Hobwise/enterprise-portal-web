'use client';
import useNotificationCount from '@/hooks/cachedEndpoints/useNotificationCount';

import { useEffect } from 'react';

export default function DynamicMetaTag({
  route = 'Dashboard',
  description = 'Streamline your business processes',
}: {
  route?: string;
  description?: string;
}) {
  const { data } = useNotificationCount();

  useEffect(() => {
    if (data) {
      document.title = `${data && `(${data})`} Hobink | ${route} `;
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [data]);

  return null;
}
