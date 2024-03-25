import { ReactNode } from 'react';

export default function MarginWidthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col md:ml-[272px] bg-white  min-h-screen'>
      {children}
    </div>
  );
}
