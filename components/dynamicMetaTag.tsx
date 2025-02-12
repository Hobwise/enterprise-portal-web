'use client';
import useNotificationCount from '@/hooks/cachedEndpoints/useNotificationCount';
import { companyInfo } from '@/lib/companyInfo';

interface Props {
  route?: string;
  description?: string;
}

export default function DynamicMetaTag({
  route = 'Dashboard',
  description = 'Streamline your business processes',
}: Props) {
  const { data } = useNotificationCount();
  return (
    <>
      <title>{`${data && data > 0 && `(${data})`} ${
        companyInfo.name
      } | ${route} `}</title>
      <meta name='description' content={description} />
    </>
  );
}
