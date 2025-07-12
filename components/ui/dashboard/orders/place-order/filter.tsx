"use client";
import { Chip, Tab, Tabs } from "@nextui-org/react";
import { useRef, useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const Filters = ({ menus, handleTabChange, handleTabClick, isLoading }: any) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScrollButtons = () => {
    const el = tabsRef.current;
    if (el) {
      setShowLeft(el.scrollLeft > 0);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => {
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [menus]);

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollLeft -= 150;
      setTimeout(checkScrollButtons, 100);
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollLeft += 150;
      setTimeout(checkScrollButtons, 100);
    }
  };

  const handleTabsScroll = () => {
    checkScrollButtons();
  };
  return (
    <>
      <div className="flex relative top-3 border-b border-divider justify-between">
        <div className="relative w-full flex items-center">
          {showLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 bg-background/75 backdrop-blur-sm h-full rounded-full"
            >
              <IoIosArrowBack className="text-xl text-default-600" />
            </button>
          )}
          <Tabs
            ref={tabsRef}
            classNames={{
              base: "w-full",
              tabList:
                "gap-4 relative rounded-none p-0 w-full text-[#344054] overflow-x-auto scroll-smooth no-scrollbar",
              cursor: "w-full bg-primaryColor h-[1px]",
              tab: "max-w-fit px-0 py-0 h-10 px-4",
              tabContent:
                "group-data-[selected=true]:text-primaryColor group-data-[selected=true]:font-semibold",
            }}
            variant={"underlined"}
            aria-label="menu filter"
            onChange={handleTabChange}
            onScroll={handleTabsScroll}
          >
            {menus?.map((menu: any, index: number) => {
              return (
                <Tab
                  key={menu.id || menu.name || `menu-tab-${index}`}
                  title={
                    <div
                      onClick={() => handleTabClick(menu.name)}
                      className="flex items-center h-10 space-x-2 capitalize"
                    >
                      <span>{menu.name}</span>

                      <Chip
                        classNames={{
                          base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                        }}
                      >
                        {menu?.totalCount}
                      </Chip>
                    </div>
                  }
                />
              );
            })}
          </Tabs>
          {showRight && (
            <button
              onClick={scrollRight}
              className="absolute -right-5 z-10 bg-background/75 backdrop-blur-sm h-full rounded-full"
            >
              <IoIosArrowForward className="text-xl text-default-600" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Filters;
