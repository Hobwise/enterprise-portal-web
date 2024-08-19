import { Suspense } from 'react';
import CreateOrder from './create-order';

export const metadata = {
  title: 'Hobink | Create order',
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
