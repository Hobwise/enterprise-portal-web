import { ReactNode } from 'react';

export default function MarginWidthWrapper({
  children,
  shouldHideSidebar
}: {
  shouldHideSidebar:any;
  children: ReactNode;
}) {
  return (
    <div className={`${shouldHideSidebar ? "" : "md:ml-[272px]"} flex flex-col  bg-white  min-h-screen`}>
      {children}
    </div>
  );
}
