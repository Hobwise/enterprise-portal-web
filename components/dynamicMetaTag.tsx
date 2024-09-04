'use client';
import useNotificationCount from '@/hooks/cachedEndpoints/useNotificationCount';

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
      <title>{`${data && `(${data})`} Hobink | ${route} `}</title>
      <meta name='description' content={description} />
    </>
  );
}
