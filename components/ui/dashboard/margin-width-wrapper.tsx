import { ReactNode } from 'react';

export default function MarginWidthWrapper({
  children,
  shouldHideSidebar,
  isCollapsed,
}: {
  shouldHideSidebar: any;
  isCollapsed?: boolean;
  children: ReactNode;
}) {
  const marginClass = shouldHideSidebar
    ? ''
    : isCollapsed
      ? 'lg:ml-[72px]'
      : 'lg:ml-[272px]';

  return (
    <div
      className={`${marginClass} flex flex-col bg-white min-h-screen transition-[margin] duration-200 ease-in-out`}
    >
      {children}
    </div>
  );
}
