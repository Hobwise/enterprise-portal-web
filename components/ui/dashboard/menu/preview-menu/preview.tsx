"use client";
import * as React from "react";
import { Divider } from "@nextui-org/react";
import Image from "next/image";

import { useGlobalContext } from "@/hooks/globalProvider";
import NoMenu from "../../../../../public/assets/images/no-menu.png";
import { togglePreview } from "./data";
import useMenu from "@/hooks/cachedEndpoints/useMenu";
import { formatPrice } from "@/lib/utils";

const Preview = () => {
  const {
    activeTile,
    isSelectedPreview,
    selectedImage,
    backgroundColor,
    selectedTextColor,
    currentMenuItems,
    currentCategory,
    currentSection,
    currentSearchQuery,
  } = useGlobalContext();

  const { data } = useMenu();

  const baseString = "data:image/jpeg;base64,";

  // Use currentMenuItems from context if available, otherwise fall back to all items
  const [items, setItems] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    // First priority: Use items from global context
    if (currentMenuItems && currentMenuItems.length > 0) {
      setItems(currentMenuItems);
    } 
    // Second priority: Check sessionStorage for persisted state
    else if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('previewMenuState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setItems(parsedState.items || []);
      } else if (data) {
        // Fall back to all items from API if no context or saved state
        setItems(data.flatMap((obj) => obj.items));
      }
    }
    // Last resort: Use data from API
    else if (data) {
      setItems(data.flatMap((obj) => obj.items));
    }
  }, [currentMenuItems, data]);
  
  const styles = togglePreview(activeTile);

  return (
    <article
      style={{
        backgroundColor: backgroundColor || "white",
      }}
      className="xl:block relative hidden w-[320px] border-[8px] overflow-y-auto border-black rounded-[40px] h-[684px] shadow-lg"
    >
      {selectedImage.length > baseString.length && (
        <Image
          fill
          className="absolute object-cover backdrop-brightness-125 opacity-25 -z-10"
          src={selectedImage}
          alt="background"
          priority
        />
      )}

      {/* Menu header */}
      <header className="sticky top-0 z-10 bg-inherit pt-4 px-4">
        <h1
          style={{ color: selectedTextColor }}
          className="text-[28px] font-bold"
        >
          Menu
        </h1>
        {(currentCategory || currentSection || currentSearchQuery) && (
          <div className="mt-1">
            {currentCategory && (
              <p style={{ color: selectedTextColor }} className="text-sm opacity-80">
                {currentCategory}{currentSection && ` / ${currentSection}`}
              </p>
            )}
            {currentSearchQuery && (
              <p style={{ color: selectedTextColor }} className="text-xs opacity-70 mt-1">
                Showing results for: "{currentSearchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Optional tabs - currently commented out */}
        {/* <div className="overflow-x-auto w-full">
          <Tabs
            classNames={{
              tabList:
                "gap-3 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primaryColor",
              tab: "max-w-fit px-0 h-10",
              tabContent: "group-data-[selected=true]:text-primaryColor",
            }}
            variant={"underlined"}
            aria-label="menu filter"
            disabledKeys={["Drinks", "Dessert", "Breakfast"]}
          >
            {menus.map((menu) => (
              <Tab
                key={menu.name}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{menu.name}</span>
                    <Chip
                      classNames={{
                        base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                      }}
                    >
                      {menu.chip}
                    </Chip>
                  </div>
                }
              />
            ))}
          </Tabs>
        </div> */}
      </header>

      <main className={`${styles.main} relative px-4 pb-4`}>
        {items?.length ? (
          items.map((item) => (
            <React.Fragment key={`${item.id || item.menuID}-${item.name || item.itemName}`}>
              <div
                className={`${styles.container} ${
                  activeTile === "List Right" &&
                  isSelectedPreview &&
                  "flex-row-reverse"
                } flex my-4 gap-3`}
              >
                {isSelectedPreview && (
                  <div className={`${styles.imageContainer} shrink-0`}>
                    <Image
                      className={`bg-cover rounded-lg ${styles.imageClass} object-cover`}
                      width={activeTile.includes("Single column") ? 300 : 60}
                      height={activeTile.includes("Single column") ? 200 : 60}
                      src={
                        item?.image
                          ? item.image.startsWith('data:') || item.image.startsWith('http')
                            ? item.image
                            : `data:image/jpeg;base64,${item.image}`
                          : NoMenu
                      }
                      alt={item.name || item.itemName || "Menu item"}
                    />
                  </div>
                )}
                <div
                  style={{ color: selectedTextColor }}
                  className={`text-[14px] ${styles.textContainer} flex flex-col justify-center`}
                >
                  {(item.category || item.menuName) && (
                    <span className="text-xs opacity-80">{item.category || item.menuName}</span>
                  )}
                  <h3 className="font-bold">{item.name || item.itemName}</h3>
                  <p className="text-[13px] font-semibold">
                    {formatPrice(item.price)}
                  </p>
                  {activeTile &&
                    activeTile !== "Single column 1" &&
                    (item.description || item.itemDescription) && (
                      <p className="text-[13px] mt-1 opacity-90">
                        {item.description || item.itemDescription}
                      </p>
                    )}
                </div>
              </div>
              {styles.divider && <Divider className=" h-[1px]" />}
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] text-center">
            <Image
              src={NoMenu}
              alt="No menu items"
              width={120}
              height={120}
              className="opacity-50 mb-4"
            />
            <p style={{ color: selectedTextColor }}>
              {currentSearchQuery 
                ? `No items found for "${currentSearchQuery}"`
                : currentSection 
                  ? `No items in ${currentSection}`
                  : 'No menu items to display'}
            </p>
          </div>
        )}
      </main>
    </article>
  );
};

export default Preview;
