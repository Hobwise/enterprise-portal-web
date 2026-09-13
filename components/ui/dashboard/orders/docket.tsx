"use client";
import { CustomButton } from "@/components/customButton";
import { getJsonItemFromLocalStorage, printPDF, saveAsPDF } from "@/lib/utils";
import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import useOrderDockets from "@/hooks/cachedEndpoints/useOrderDockets";
import useOrderDetails from "@/hooks/cachedEndpoints/useOrderDetails";

export interface DocketCategory {
  categoryId: string;
  categoryName: string;
}

interface DocketModalProps {
  isOpenDocket: boolean;
  singleOrder: any;
  toggleDocketModal: () => void;
  /** All menu categories — each is queried to see if it has items on the order. */
  categories: DocketCategory[];
}

/**
 * Groups docket items so identical lines collapse while distinct comments stay
 * separate (the comment is part of the grouping key). Pricing is intentionally
 * omitted — a docket only carries what the station needs to prepare.
 */
const groupDocketItems = (items: any[]) => {
  if (!items) return [];

  const grouped = items.reduce((acc: any, item: any) => {
    const comment = item.comment || "";
    const key = `${item.itemName}-${item.isPacked ? "packed" : "unpacked"}-${comment}`;

    if (!acc[key]) {
      acc[key] = {
        itemName: item.itemName,
        quantity: 0,
        isPacked: item.isPacked,
        comment,
      };
    }

    acc[key].quantity += item.quantity;
    return acc;
  }, {});

  return Object.values(grouped);
};

const DocketModal = ({
  isOpenDocket,
  singleOrder,
  toggleDocketModal,
  categories,
}: DocketModalProps) => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");
  const docketRef = useRef(null);

  const [selectedCategory, setSelectedCategory] =
    useState<DocketCategory | null>(null);

  // When we have the menu categories, query each category's docket in parallel
  // so we know which ones actually have items on this order.
  const hasCategories = (categories?.length ?? 0) > 0;
  const { dockets: categoryDockets, isLoading: isLoadingCategoryDockets } =
    useOrderDockets(categories, singleOrder?.id, {
      enabled: isOpenDocket && hasCategories,
    });

  // Fallback for users/roles that can't read the menu-categories list (e.g. POS
  // or category staff): build a single docket straight from the order's own
  // items. Anyone who can see the order can read this.
  const { orderDetails: fullOrder, isLoading: isLoadingFullOrder } =
    useOrderDetails(singleOrder?.id, {
      enabled: isOpenDocket && !hasCategories,
    });

  const dockets = useMemo(() => {
    if (hasCategories) {
      return categoryDockets;
    }
    const items = fullOrder?.orderDetails ?? [];
    return [
      {
        category: { categoryId: "all", categoryName: "All Items" },
        items,
      },
    ];
  }, [hasCategories, categoryDockets, fullOrder]);

  const isLoading = hasCategories
    ? isLoadingCategoryDockets
    : isLoadingFullOrder;

  // Only categories with at least one item are offered / shown.
  const nonEmptyDockets = useMemo(
    () => dockets.filter((entry) => entry.items.length > 0),
    [dockets]
  );

  // Auto-pick when exactly one category has items, so the user goes straight to
  // the docket instead of a single-option picker. Reset on close.
  useEffect(() => {
    if (!isOpenDocket) {
      setSelectedCategory(null);
      return;
    }
    if (nonEmptyDockets.length === 1) {
      setSelectedCategory(nonEmptyDockets[0].category);
    }
  }, [isOpenDocket, nonEmptyDockets]);

  const selectedItems = useMemo(() => {
    if (!selectedCategory) return [];
    const entry = dockets.find(
      (d) => d.category.categoryId === selectedCategory.categoryId
    );
    return entry?.items ?? [];
  }, [dockets, selectedCategory]);

  const groupedItems = groupDocketItems(selectedItems);
  const totalItems = groupedItems.length;

  // View resolution: wait for the batch, then either show the docket (category
  // chosen / single category) or the multi-category picker.
  const resolving = isLoading && !selectedCategory;
  const noItems = !isLoading && nonEmptyDockets.length === 0;
  const showPicker =
    !resolving && !noItems && !selectedCategory && nonEmptyDockets.length > 1;
  const showDocket = !!selectedCategory;
  const showActions = showDocket && groupedItems.length > 0;

  const renderResolving = () => (
    <div className="flex flex-col items-center my-8">
      <Spinner size="sm" />
      <p className="text-center mt-1 text-[13px] text-grey400">
        Loading docket...
      </p>
    </div>
  );

  const renderNoItems = () => (
    <div className="flex flex-col items-center my-8 p-4">
      <h3 className="font-[600] text-center text-lg text-black mb-1">
        Generate Docket
      </h3>
      <p className="text-center text-sm text-grey500">
        There are no items to generate a docket for on this order.
      </p>
    </div>
  );

  const renderCategoryPicker = () => (
    <div className="flex flex-col gap-2 py-4">
      <h3 className="font-[600] text-center text-lg text-black">
        Generate Docket
      </h3>
      <p className="text-center text-sm text-grey500 mb-2">
        This order spans multiple categories — select one to generate its docket
      </p>
      {nonEmptyDockets.map((entry) => (
        <button
          key={entry.category.categoryId}
          type="button"
          onClick={() => setSelectedCategory(entry.category)}
          className="flex items-center justify-between rounded-lg border border-primaryGrey px-4 py-3 text-left text-sm font-medium text-black transition-colors hover:bg-primaryColor/5 hover:border-primaryColor"
        >
          <span>{entry.category.categoryName}</span>
          <MdKeyboardArrowRight className="text-[20px] text-grey500" />
        </button>
      ))}
    </div>
  );

  const renderDocket = () => (
    <>
      {/* Only offer a way back when there was a choice to begin with. */}
      {nonEmptyDockets.length > 1 && (
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-sm font-medium text-grey500 hover:text-black mt-2"
        >
          <IoIosArrowRoundBack className="text-[22px]" />
          Back to categories
        </button>
      )}

      <div ref={docketRef} className="h-auto flex flex-col overflow-y-auto">
        {/* Header Section */}
        <h3 className="font-[600] text-center text-lg text-black mt-4">
          {businessInformation[0]?.businessName}
        </h3>
        <p className="text-center text-sm text-grey500 mb-1">
          {businessInformation[0]?.businessAddress}
          {businessInformation[0]?.city &&
            businessInformation[0]?.state &&
            `, ${businessInformation[0]?.city}, ${businessInformation[0]?.state}`}
        </p>
        <p className="text-center text-sm font-semibold text-black mb-4">
          Docket
        </p>

        {/* Order Metadata - addressed to the category, not the customer */}
        <div className="text-sm mb-2">
          <div className="flex justify-between py-1">
            <span className="font-semibold text-black">Category</span>
            <span className="text-black">{selectedCategory?.categoryName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-semibold text-black">
              {singleOrder?.qrReference || "N/A"}
            </span>
            <span className="text-black">{totalItems} items</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-semibold text-black">Order Ref</span>
            <span className="text-black">{singleOrder?.reference}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-semibold text-black">Date & Time</span>
            <span className="text-black">
              {moment(singleOrder?.dateCreated).format("MMM. D, YYYY, h:mma")}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-semibold text-black">Printed Date</span>
            <span className="text-black">
              {moment().format("MMM. D, YYYY, h:mma")}
            </span>
          </div>
        </div>

        <Divider className="my-2" />

        <div className="flex justify-between text-sm py-1">
          <span className="font-semibold text-black">Served By</span>
          <span className="text-black">
            {userInformation?.firstName} {userInformation?.lastName}
          </span>
        </div>

        <Divider className="my-2" />

        {groupedItems.length === 0 ? (
          <div className="flex flex-col items-center my-5 p-4 bg-yellow-50 rounded-lg">
            <p className="text-center text-yellow-700 font-medium">
              No items for this category
            </p>
          </div>
        ) : (
          <>
            {/* Items Table Header — no amount column on a docket */}
            <div className="flex gap-3 text-sm font-semibold text-black mb-2">
              <div className="w-12">Qty</div>
              <div className="flex-1 text-center">Description</div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {groupedItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 border-b pb-1 text-sm text-black"
                >
                  <div className="w-12 text-black">{item.quantity}</div>
                  <div className="flex-1 text-center">
                    <div className="text-black font-medium">
                      {item.itemName}
                      {item.isPacked && (
                        <span className="text-grey500 text-xs ml-1">
                          (packed)
                        </span>
                      )}
                    </div>
                    {item.comment && (
                      <div className="text-xs text-grey500 mt-0.5 italic">
                        Note: {item.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Divider className="my-3" />
          </>
        )}
      </div>
    </>
  );

  return (
    <Modal
      isDismissable={false}
      isOpen={isOpenDocket}
      onOpenChange={toggleDocketModal}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="flex max-h-[80vh] justify-center">
              {resolving
                ? renderResolving()
                : noItems
                ? renderNoItems()
                : showPicker
                ? renderCategoryPicker()
                : renderDocket()}
            </ModalBody>
            <Spacer y={1} />
            {showActions && (
              <ModalFooter className="w-full flex gap-5">
                <CustomButton
                  className="bg-white text-black border border-primaryGrey flex-grow"
                  onClick={() => saveAsPDF(docketRef, "docket.pdf")}
                  type="button"
                >
                  Save
                </CustomButton>
                <CustomButton
                  onClick={() => printPDF(docketRef, "docket.pdf")}
                  className="flex-grow text-white"
                  type="button"
                >
                  Print
                </CustomButton>
              </ModalFooter>
            )}
            <Spacer y={2} />
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DocketModal;
