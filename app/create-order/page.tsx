import { companyInfo } from '@/lib/companyInfo';
import { Suspense } from 'react';
import CreateOrder from './create-order';

export const metadata = {
  title: `${companyInfo.name} | Create order`,
  description: 'Streamline your business processes',
};

const page = () => {
  return (
    <Suspense>
      <CreateOrder />
    </Suspense>
  );
};

export default page;
