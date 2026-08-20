import { Suspense } from 'react';
import CreateOrder from './create-order';

// Title uses the business name from the link so each business sees its own
// branding (falls back to a generic label when the param is missing).
export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<{ businessName?: string }>;
}) => {
  const resolvedParams = await searchParams;
  const businessName = resolvedParams?.businessName?.trim();
  return {
    title: businessName ? `${businessName} | Create order` : 'Create order',
    description: 'Streamline your business processes',
  };
};

const page = () => {
  return (
    <Suspense>
      <CreateOrder />
    </Suspense>
  );
};

export default page;
