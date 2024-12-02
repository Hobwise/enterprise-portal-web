import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className='flex scroll-smooth flex-col md:p-6 p-4 space-y-2 text-black
    flex-grow'
    >
      {children}
    </div>
  );
}
