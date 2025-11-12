"use client";
import * as React from "react";
import Image from "next/image";

import { useGlobalContext } from "@/hooks/globalProvider";
import NoMenu from "../../../../../public/assets/images/no-menu-1.jpg";
import { togglePreview } from "./data";
import { formatPrice, getJsonItemFromLocalStorage } from "@/lib/utils";
import useCustomerMenuCategories from "@/hooks/cachedEndpoints/useCustomerMenuCategories";
import useCustomerMenuItems from "@/hooks/cachedEndpoints/useCustomerMenuItems";
import {
  IoChevronBack,
  IoChevronForward,
  IoSearchOutline,
} from "react-icons/io5";
import { HiOutlineMicrophone } from "react-icons/hi";
import RestaurantBanner from "@/app/create-order/RestaurantBanner";

const Preview = () => {
  const {
    activeTile,
    isSelectedPreview,
    selectedImage,
    backgroundColor,
    selectedTextColor,
  } = useGlobalContext();

  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessId = businessInformation?.[0]?.businessId;
  const businessName = businessInformation?.[0]?.businessName || "";
  const cooperateId = userInformation?.cooperateID;

  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<string>("");
  const [categoryScrollRef, setCategoryScrollRef] =
    React.useState<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Handle image URL properly - blob URLs and base64 strings
  const isBlobUrl = selectedImage?.startsWith("blob:");

  const menuConfig = {
    image: isBlobUrl
      ? selectedImage
      : selectedImage?.replace("data:image/jpeg;base64,", ""),
    backgroundColour: backgroundColor,
    textColour: selectedTextColor,
    useBackground: isSelectedPreview,
  };

  const baseString = isBlobUrl ? "" : "data:image/jpeg;base64,";

  // Dynamic color from menu config (fallback to primary color)
  const primaryColor = backgroundColor || "#5F35D2";
  const primaryColorStyle = { backgroundColor: primaryColor };
  const textColorStyle = { color: primaryColor };

  const { data: categories, isLoading: categoriesLoading } =
    useCustomerMenuCategories(businessId, cooperateId);
  const { data: menuItems, isLoading: itemsLoading } = useCustomerMenuItems(
    selectedCategoryId,
    "",
    100
  );

  // Filter menu items by search query
  const filteredMenuItems = React.useMemo(() => {
    if (!menuItems) return [];
    if (!searchQuery.trim()) return menuItems;

    return menuItems.filter(
      (item) =>
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  const checkScrollPosition = () => {
    if (categoryScrollRef) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef) {
      const scrollAmount = 200;
      categoryScrollRef.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  React.useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  React.useEffect(() => {
    checkScrollPosition();
  }, [categoryScrollRef]);

  const styles = togglePreview(activeTile, true);

  return (
    <article
      className={`relative w-full max-w-[300px] mx-auto border-[8px] overflow-y-auto border-black rounded-[40px] h-[600px] bg-white`}
    >
      {/* Restaurant Banner */}
      <RestaurantBanner
        businessName={businessName || ""}
        menuConfig={menuConfig}
        showMenuButton={false}
        baseString={baseString}
      />

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <IoSearchOutline className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 text-black pr-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent outline-none bg-gray-50"
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <HiOutlineMicrophone className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Category Pills Filter with Arrows */}
      {categories && categories.length > 0 && (
        <div className="relative px-4 py-3 bg-white">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              aria-label="Scroll left"
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
            >
              <IoChevronBack className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Category Pills */}
          <div
            ref={(el) => {
              if (el && el !== categoryScrollRef) {
                setCategoryScrollRef(el);
                setTimeout(() => checkScrollPosition(), 100);
              }
            }}
            onScroll={checkScrollPosition}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category: any) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  style={isSelected ? primaryColorStyle : {}}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              aria-label="Scroll right"
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
            >
              <IoChevronForward className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      )}

      {/* Menu Items - Dynamic Layout */}
      <div className="pb-20">
        {categoriesLoading || itemsLoading ? (
          <div className="px-4">
            {/* Skeleton for grid/list layouts */}
            <div className="grid grid-cols-1 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  {/* Image Skeleton */}
                  <div className="h-36 bg-gray-200"></div>

                  {/* Content Skeleton */}
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredMenuItems && filteredMenuItems.length > 0 ? (
          <div className={`${styles.main}`}>
            {filteredMenuItems.map((item) => {
              const isListLayout = activeTile?.includes("List");
              const isCompactGrid = activeTile === "Single column 2";
              const layoutName = activeTile;

              return (
                <div
                  key={`${item.id || item.menuID}-${
                    item.name || item.itemName
                  }`}
                  className={`${
                    isListLayout ? "flex items-center gap-3" : ""
                  } my-3 relative`}
                >
                  <div
                    className={`${styles.container} ${
                      layoutName === "List Right" && "flex-row-reverse"
                    } ${
                      isListLayout ? "flex flex-1" : ""
                    } text-black relative transition-all shadow-md`}
                  >
                    {/* Image Container */}
                    {isSelectedPreview && (
                      <div
                        className={`${styles.imageContainer || ""} relative`}
                      >
                        <div
                          className={`relative bg-gradient-to-br from-primaryColor/10 via-primaryColor/5 to-purple-100 flex items-center justify-center overflow-hidden ${
                            styles.imageClass || "h-32"
                          }`}
                        >
                          {item?.image &&
                          item.image.length > baseString.length ? (
                            <Image
                              className="object-cover w-full h-full"
                              width={300}
                              height={200}
                              src={baseString + item.image}
                              alt={item.itemName || "Menu item"}
                            />
                          ) : (
                            <Image
                              src={NoMenu}
                              alt="No image"
                              width={60}
                              height={60}
                              className="opacity-30"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content Container */}
                    <div
                      className={`${styles.textContainer} flex flex-col ${
                        isListLayout ? "justify-center" : "justify-start"
                      }`}
                    >
                      <p
                        className={`font-bold ${
                          isCompactGrid ? "text-xs" : "text-sm"
                        } line-clamp-1`}
                      >
                        {item.itemName}
                      </p>
                      <p
                        className={`text-gray-500 ${
                          isCompactGrid ? "text-[10px]" : "text-xs"
                        } line-clamp-2 mt-0.5`}
                      >
                        {item.itemDescription || ""}
                      </p>
                      <p
                        style={textColorStyle}
                        className={`font-semibold ${
                          isCompactGrid ? "text-xs" : "text-sm"
                        } mt-1`}
                      >
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Image
              src={NoMenu}
              alt="No menu items"
              width={80}
              height={80}
              className="opacity-50 mb-4"
            />
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? `No items found for "${searchQuery}"`
                : "No menu items to display"}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

export default Preview;
