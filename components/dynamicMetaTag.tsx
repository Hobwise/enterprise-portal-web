'use client';
import { companyInfo } from '@/lib/companyInfo';

interface Props {
  route?: string;
  description?: string;
}

export default function DynamicMetaTag({
  route = 'Dashboard',
  description = 'Streamline your business processes',
}: Props) {
  return (
    <>
      <title>{`${companyInfo.name} | ${route} `}</title>
      <meta name='description' content={description} />
    </>
  );
}
