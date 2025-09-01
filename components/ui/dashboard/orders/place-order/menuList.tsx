"use client";
import { getOrder } from "@/app/api/controllers/dashboard/orders";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import useMenuCategories from "@/hooks/cachedEndpoints/useMenuCategories";
import { useGlobalContext } from "@/hooks/globalProvider";
import {
  clearItemLocalStorage,
  formatPrice,
  getJsonItemFromLocalStorage,
} from "@/lib/utils";
import {
  Button,
  Divider,
  Spacer,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import noMenu from "../../../../../public/assets/images/no-menu.png";
import CheckoutModal from "./checkoutModal";
import {
  SelectedSkeletonLoading,
} from "./data";
import ViewModal from "./view";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import OrderCategoryTabs from "./OrderCategoryTabs";
import OrderMenuToolbar from "./OrderMenuToolbar";
import OrderItemsGrid from "./OrderItemsGrid";
import CustomPagination from "../../settings/BillingsComponents/CustomPagination";
import { getMenuItems } from "@/app/api/controllers/dashboard/menu";

type Item = {
  id: string;
  itemID: string;
  itemName: string;
  menuName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image: string;
  isVariety: boolean;
  varieties: null | any;
  count: number;
  packingCost: number;
  isPacked?: boolean;
};


// Global cache for order menu items
const globalOrderItemsCache = new Map<string, { 
  items: any[], 
  timestamp: number,
  totalPages: number,
  totalItems: number,
  currentPage: number 
}>();
const GLOBAL_CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

const MenuList = () => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { 
    setCurrentMenuItems, 
    setCurrentCategory, 
    setCurrentSection
  } = useGlobalContext();

  const [order] = useState<any>(getJsonItemFromLocalStorage("order"));
  const { data: categoriesData, isLoading: loadingCategories } = useMenuCategories();
  const [categories, setCategories] = useState<any[]>([]);
  
  // State management for hierarchy
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');
  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalItems] = useState(0);
  const pageSize = 20;
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [filterValue, setFilterValue] = React.useState("");

  // Transform categories data
  useEffect(() => {
    if (categoriesData) {
      const transformedCategories = categoriesData.map(category => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        orderIndex: category.orderIndex,
        menus: category.menus || []
      }));
      setCategories(transformedCategories);
    }
  }, [categoriesData]);

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    
    return menuItems.filter(item =>
      item?.itemName?.toLowerCase().includes(filterValue.toLowerCase()) ||
      String(item?.price)?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item?.menuName?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item?.itemDescription?.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [menuItems, filterValue]);

  // Initialize categories and sections
  useEffect(() => {
    if (categories && categories.length > 0 && !hasInitialized) {
      const firstCategory = categories[0];
      setActiveCategory(firstCategory.categoryId);
      
      // Set menu sections for first category
      const allMenuSections = firstCategory.menus.flatMap((menu: any) => 
        menu.menuSections || []
      );
      setMenuSections(allMenuSections);
      
      // Set first section as active
      if (allMenuSections.length > 0) {
        setActiveSubCategory(allMenuSections[0].id);
      }
      
      setHasInitialized(true);
    }
  }, [categories, hasInitialized]);

  // Load items when active section changes
  useEffect(() => {
    if (activeSubCategory && !loadingItems && hasInitialized) {
      fetchMenuItems(activeSubCategory, currentPage);
    }
  }, [activeSubCategory, currentPage, hasInitialized]);

  const [loading, setLoading] = useState<Boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isOpenVariety, setIsOpenVariety] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<Item>();
  const [orderDetails, setOrderDetails] = useState([]);

  // Business information
  const businessInformation = getJsonItemFromLocalStorage('business');

  // Fetch menu items for a section
  const fetchMenuItems = async (sectionId: string, page: number = 1) => {
    const cacheKey = `${sectionId}_page_${page}`;
    
    // Check cache first
    const cached = globalOrderItemsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_EXPIRY_TIME)) {
      setMenuItems(cached.items);
      setTotalPages(cached.totalPages);
      setTotalItems(cached.totalItems);
      setCurrentPage(cached.currentPage);
      return;
    }

    setLoadingItems(true);
    setIsError(false);
    
    try {
      const response = await getMenuItems(
        sectionId,
        page,
        pageSize
      );

      if (response?.data?.isSuccessful) {
        const items = response.data.data.items || [];
        const transformedItems = items.map((item: any) => ({
          ...item,
          id: item.id || item.itemID,
          itemID: item.id || item.itemID,
          isAvailable: item.isAvailable !== false,
          count: 0,
          packingCost: item.packingCost || 0,
        }));

        const paginationData = {
          items: transformedItems,
          timestamp: Date.now(),
          totalPages: response.data.data.totalPages || 1,
          totalItems: response.data.data.totalItems || transformedItems.length,
          currentPage: page
        };

        // Cache the results
        globalOrderItemsCache.set(cacheKey, paginationData);
        
        setMenuItems(transformedItems);
        setTotalPages(paginationData.totalPages);
        setTotalItems(paginationData.totalItems);
        setCurrentPage(page);
        
        // Update global context
        setCurrentMenuItems(transformedItems);
      } else {
        setIsError(true);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setIsError(true);
      setMenuItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const getOrderDetails = async () => {
    setLoading(true);
    const response = await getOrder(order.id);

    setLoading(false);
    if (response?.data?.isSuccessful) {
      const updatedArray = response?.data?.data.orderDetails.map((item: any) => {
        const { unitPrice, quantity, itemID, ...rest } = item;
        
        return {
          ...rest,
          id: itemID,
          price: unitPrice,
          count: quantity,
          packingCost: item.packingCost || 0,
        };
      });
      setOrderDetails(response?.data?.data);
      setSelectedItems(() => updatedArray);

      clearItemLocalStorage("order");
    } else if (response?.data?.error) {
    }
  };

  const toggleVarietyModal = (menu: any) => {
    setSelectedMenu(menu);
    setIsOpenVariety(!isOpenVariety);
  };

  // Category and section handlers
  const handleCategorySelect = async (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
    
    // Find selected category and set its menu sections
    const selectedCategory = categories.find(cat => cat.categoryId === categoryId);
    
    if (selectedCategory) {
      const allMenuSections = selectedCategory.menus.flatMap((menu: any) => 
        menu.menuSections || []
      );
      setMenuSections(allMenuSections);
      
      // Auto-select first section
      if (allMenuSections.length > 0) {
        setActiveSubCategory(allMenuSections[0].id);
        await fetchMenuItems(allMenuSections[0].id, 1);
      } else {
        setMenuItems([]);
        setActiveSubCategory('');
        setIsError(false); // Not an error, just empty
      }
      
      // Update global context
      setCurrentCategory(selectedCategory.categoryName);
    } else {
      setIsError(true);
    }
  };

  const handleMenuSectionSelect = async (sectionId: string) => {
    setActiveSubCategory(sectionId);
    setCurrentPage(1);
    await fetchMenuItems(sectionId, 1);
    
    // Update global context
    const selectedSection = menuSections.find(section => section.id === sectionId);
    if (selectedSection) {
      setCurrentSection(selectedSection.name);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRetry = () => {
    if (activeSubCategory) {
      fetchMenuItems(activeSubCategory, currentPage);
    }
  };


  const handleCardClick = useCallback((menuItem: Item, isItemPacked: boolean) => {
    setSelectedItems((prevItems: any) => {
      const existingItem = prevItems.find((item: any) => item.id === menuItem.id);
      
      if (existingItem) {
        // Remove item if it exists
        return prevItems.filter((item: any) => item.id !== menuItem.id);
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            ...menuItem,
            count: 1,
            isPacked: isItemPacked,
            packingCost:
              menuItem.packingCost ||
              (menuItem.isVariety ? menuItem.packingCost : 0),
          },
        ];
      }
    });
  }, []);

  const handleQuickAdd = useCallback((menuItem: Item, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the variety modal
    
    setSelectedItems((prevItems: any) => {
      const existingItem = prevItems.find((item: any) => item.id === menuItem.id);
      
      if (existingItem) {
        // If item exists, remove it (toggle off)
        return prevItems.filter((item: any) => item.id !== menuItem.id);
      } else {
        // Add new item with default options
        return [
          ...prevItems,
          {
            ...menuItem,
            count: 1,
            isPacked: false, // Default to not packed
            packingCost: menuItem.packingCost || 0,
          },
        ];
      }
    });
  }, []);

  const handleDecrement = useCallback((id: string) => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setIsUpdating(true);
    
    setSelectedItems((prevItems: any) => {
      // Filter out items with count <= 1 first, then decrement others
      const updatedItems = prevItems
        .filter((item: any) => !(item.id === id && item.count <= 1))
        .map((item: any) => 
          item.id === id 
            ? { ...item, count: Math.max(1, item.count - 1) }
            : item
        );
      
      // Use setTimeout to allow state to settle
      setTimeout(() => setIsUpdating(false), 100);
      return updatedItems;
    });
  }, [isUpdating]);

  const handleIncrement = useCallback((id: string) => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setIsUpdating(true);
    
    setSelectedItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, count: Math.min(item.count + 1, 999) } : item
      );
      
      // Use setTimeout to allow state to settle
      setTimeout(() => setIsUpdating(false), 100);
      return updatedItems;
    });
  }, [isUpdating]);

  const calculateTotalPrice = () => {
    return selectedItems.reduce((acc, item) => {
      const itemTotal = item.price * item.count;
      // Allow packing even when packingCost is 0 or undefined
      const packingTotal = item.isPacked
        ? (item.packingCost >= 0 ? item.packingCost : 0) * item.count
        : 0;
      return acc + itemTotal + packingTotal;
    }, 0);
  };

  useEffect(() => {
    if (order?.id && categories && categories.length > 0) {
      getOrderDetails();
    }
  }, [order?.id, categories]);

  const handlePackingCost = useCallback((itemId: string, isPacked: boolean) => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isPacked } : item
      )
    );
  }, [isUpdating]);

  const handleOpenCheckoutModal = useCallback(() => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        // Only update packingCost if it's undefined or null
        // This preserves the original packingCost from when the item was added
        if (item.packingCost === undefined || item.packingCost === null) {
          const menuItem = menuItems?.find(
            (menu: Item) => menu.id === item.id
          );
          return {
            ...item,
            packingCost: menuItem?.packingCost || 0,
          };
        }
        // Keep the existing packingCost
        return item;
      })
    );
    onOpen();
  }, [isUpdating, menuItems, onOpen]);

  return (
    <>
      <div className="flex flex-row flex-wrap  justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.back()}
              className="text-grey600 p-0 m-0 border-none outline-none flex items-center gap-2 text-sm"
            >
              <IoIosArrowRoundBack className="text-[22px]" />
              <p>Go back</p>
            </button>
          </div>
          <div className="text-[24px] leading-8 font-semibold">
            <span>Create Orders</span>
          </div>
          <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
            Showing all orders
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div>
            <CustomInput
              classnames={"w-[242px]"}
              label=""
              size="md"
              value={filterValue}
              onChange={(e: any) => {
                const value = e.target.value;
                if (value) {
                  setFilterValue(value);
                  setCurrentPage(1);
                } else {
                  setFilterValue("");
                }
              }}
              isRequired={false}
              startContent={<IoSearchOutline />}
              type="text"
              placeholder="Search here..."
            />
          </div>
          <CustomButton
            onClick={selectedItems.length > 0 ? handleOpenCheckoutModal : {}}
            className="py-2 px-4 mb-0 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-2 items-center justify-center">
              <p>{"Proceed"} </p>
              <HiArrowLongLeft className="text-[22px] rotate-180" />
            </div>
          </CustomButton>
        </div>
      </div>

      <section className="mt-6 flex flex-col xl:flex-row gap-6">
          <div className="w-full">
             {/* Category Tabs */}
        <OrderCategoryTabs
          loadingCategories={loadingCategories}
          categories={categories}
          activeCategory={activeCategory}
          handleCategorySelect={handleCategorySelect}
        />
        
        {/* Menu Sections Toolbar - only show if we have sections */}
        {menuSections.length > 0 && (
          <OrderMenuToolbar
            menuSections={menuSections}
            activeSubCategory={activeSubCategory}
            handleMenuSectionSelect={handleMenuSectionSelect}
          />
        )}
        <div className="flex mt-6 gap-3">
          <div className=" w-full">
            {/* Items Grid */}
            <OrderItemsGrid
              loadingItems={loadingItems}
              menuItems={filteredItems}
              selectedItems={selectedItems}
              onItemClick={toggleVarietyModal}
              onQuickAdd={handleQuickAdd}
              searchQuery={filterValue}
              isError={isError}
              onRetry={handleRetry}
            />

            <Spacer y={8} />
            {/* Pagination */}
            {!loadingItems && totalPages > 1 && (
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
          </div>
        </div>
          </div>
          <article className="hidden xl:flex xl:flex-col p-4 rounded-lg w-[550px] h-full">
            {selectedItems.length > 0 ? (
              <>
                {/* Business Name Header */}
                <div className="mb-4">
                  <h1 className="text-lg font-[700] text-gray-800">
                    {businessInformation[0]?.businessName || 'Business Name'}
                  </h1>
                </div>
                
                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <h2 className="font-[600] mb-2">
                    {selectedItems.reduce((total, item) => total + item.count, 0)} Item{selectedItems.reduce((total, item) => total + item.count, 0) !== 1 ? 's' : ''} selected
                  </h2>
                <div className="rounded-lg ">
                  {selectedItems?.map((item, index) => {
                    return (
                      <>
                        <div
                          key={item.id}
                          className="flex py-3 justify-between items-center cursor-pointer"
                          onDoubleClick={() => handleCardClick(item, item.isPacked || false)}
                        >
                          <div className=" rounded-lg text-black  flex">
                            {/* <div>
                              <Image
                                src={
                                  item?.image
                                    ? `data:image/jpeg;base64,${item?.image}`
                                    : noImage
                                }
                                width={20}
                                height={20}
                                className="object-cover rounded-lg w-20 h-20"
                                aria-label="uploaded image"
                                alt="uploaded image(s)"
                              />
                            </div> */}
                            <div className="ml-3 flex flex-col w-24 text-sm justify-center">
                              <p className="font-[500] text-base text-[#344054]">{item.menuName}</p>
                              <Spacer y={1} />
                              <p className="text-[#475367] text-sm ">{item.itemName}</p>

                             
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              onClick={() => handleDecrement(item.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="faded"
                              className="border border-[#EFEFEF]"
                              aria-label="minus"
                              isDisabled={isUpdating}
                            >
                              <FaMinus />
                            </Button>
                            <span className="font-bold py-2 px-4">
                              {item.count}
                            </span>
                            <Button
                              onClick={() => handleIncrement(item.id)}
                              isIconOnly
                              radius="sm"
                              size="sm"
                              variant="faded"
                              className="border border-[#EFEFEF]"
                              aria-label="plus"
                              isDisabled={isUpdating}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                           <p className=" font-medium text-sm w-24 text-[#344054]">
                                {formatPrice(item?.price)}
                              </p>
                        </div>
                        {index !== selectedItems?.length - 1 && (
                          <Divider className="bg-[#E4E7EC80]" />
                        )}
                      </>
                    );
                  })}
                </div>
                </div>
                
                {/* Sticky Pricing Section */}
                <div className="sticky bottom-0 bg-white   pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[13px] font-[500]">Subtotal</h3>
                      <p className="text-[14px] font-[600]">
                        {formatPrice(calculateTotalPrice())}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-[13px] font-[500] text-gray-600">VAT (7.5%)</h3>
                      <p className="text-[14px] font-[500] text-gray-600">
                        {formatPrice(calculateTotalPrice() * 0.075)}
                      </p>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center">
                      <h3 className="text-[14px] font-[600]">Total</h3>
                      <p className="text-[16px] font-[700] text-primaryColor">
                        {formatPrice(calculateTotalPrice() * 1.075)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {loading ? (
                  <SelectedSkeletonLoading />
                ) : (
                  <div className="flex flex-col h-full rounded-xl justify-center items-center">
                    <Image
                      className="w-[50px] h-[50px]"
                      src={noMenu}
                      alt="no menu illustration"
                    />
                    <Spacer y={3} />
                    <p className="text-sm =">
                      Selected menu(s) will appear here
                    </p>
                  </div>
                )}
              </>
            )}
          </article>
        <CheckoutModal
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          selectedItems={selectedItems}
          totalPrice={calculateTotalPrice()}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          id={order?.id}
          orderDetails={orderDetails}
          handlePackingCost={handlePackingCost}
        />
        <ViewModal
          handleCardClick={handleCardClick}
          selectedMenu={selectedMenu}
          isOpenVariety={isOpenVariety}
          toggleVarietyModal={toggleVarietyModal}
          selectedItems={selectedItems}
          handlePackingCost={handlePackingCost}
        />
      </section>
    </>
  );
};

export default MenuList;
