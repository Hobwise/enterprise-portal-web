"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import {
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Mail,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { StockTransferIcon } from "@/public/assets/svg";
import { cn, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import useInventoryItems from "@/hooks/cachedEndpoints/useInventoryItems";
import {
  createStockTransfer,
  getIncomingTransfers,
  getStockTransferDetails,
  getStockTransfersByBusiness,
  confirmStockTransfer,
  cancelStockTransfer,
  sendStockTransferMail,
  deleteStockTransfer,
} from "@/app/api/controllers/dashboard/inventory";
import SendEmailModal from "@/components/ui/dashboard/inventory/purchase-request/SendEmailModal";
import { fetchQueryConfig } from "@/lib/queryConfig";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";
import SpinnerLoader from "@/components/ui/dashboard/menu/SpinnerLoader";

type Step = "list" | "select" | "initiate";

interface StockTransfer {
  id: string;
  issueDate: string;
  transferId: string;
  destinationBusinessName: string;
  status: "Confirmed" | "In Transit" | "Delivered" | "Cancelled";
  itemCount: number;
}

interface IncomingTransfer {
  id: string;
  issueDate: string;
  transferId: string;
  receivedFrom: string;
  certification: "Unverified" | "Verified";
  itemCount: number;
  status: "Confirm" | "Verified";
}

interface ActivityLogItem {
  id: string;
  type: "created" | "initiated" | "completed" | "unverified";
  title: string;
  id_tag: string;
  description: string;
  timestamp: string;
}

interface TransferItem {
  id: string;
  name: string;
  unit: string;
  unitCategory: number;
  currentStock: number;
  transferQty: number;
  cost: number;
  destinationId?: string;
  destinationName?: string;
  destinationUnit?: string;
}

const MarylandIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
      fill="#5F35D2"
    />
  </svg>
);

const SwapIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.1667 5.83331L17.5 9.16665L14.1667 12.5"
      stroke="#6C7278"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 9.16669H17.5"
      stroke="#6C7278"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83333 14.1667L2.5 10.8334L5.83333 7.50002"
      stroke="#6C7278"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 10.8333L2.5 10.8333"
      stroke="#6C7278"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IncomingIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
      stroke={active ? "#5F35D2" : "#667085"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.66666 6.66669L8 10L11.3333 6.66669"
      stroke={active ? "#5F35D2" : "#667085"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 10V2"
      stroke={active ? "#5F35D2" : "#667085"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ActivityLogIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.33334 8.66669H4L6 2.66669L10 14L12 8.66669H14.6667"
      stroke={active ? "#5F35D2" : "#667085"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  loadingLabel: string;
  tone: "danger" | "warning";
}

function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  message,
  confirmLabel,
  loadingLabel,
  tone,
}: ConfirmActionModalProps) {
  const palette =
    tone === "danger"
      ? {
          headerBg: "from-red-50 to-red-100/50 border-red-200/30",
          iconRingOuter: "bg-red-100",
          iconRingInner: "bg-red-200",
          iconColor: "text-red-600",
          accent: "from-red-400 to-red-600",
          button:
            "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        }
      : {
          headerBg: "from-amber-50 to-amber-100/50 border-amber-200/30",
          iconRingOuter: "bg-amber-100",
          iconRingInner: "bg-amber-200",
          iconColor: "text-amber-600",
          accent: "from-amber-400 to-amber-600",
          button:
            "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        };

  return (
    <Modal
      isDismissable={!isLoading}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
      size="lg"
      hideCloseButton
      classNames={{
        wrapper: "items-center justify-center",
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "border border-gray-200",
      }}
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl">
        {() => (
          <>
            <ModalBody className="p-0">
              <div
                className={cn(
                  "relative bg-gradient-to-br p-8 rounded-t-2xl border-b",
                  palette.headerBg,
                )}
              >
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center",
                        palette.iconRingOuter,
                      )}
                    >
                      <div
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center",
                          palette.iconRingInner,
                        )}
                      >
                        <AlertTriangle
                          className={cn("w-10 h-10", palette.iconColor)}
                        />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {title}
                  </h2>

                  <div
                    className={cn(
                      "w-16 h-1 rounded-full bg-gradient-to-r",
                      palette.accent,
                    )}
                  />
                </div>
              </div>

              <div className="px-8 py-6">
                <div className="text-center">
                  <p className="text-gray-700 text-base leading-relaxed max-w-md mx-auto">
                    {message}
                  </p>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-center w-full gap-3">
                <Button
                  onClick={onClose}
                  isDisabled={isLoading}
                  variant="bordered"
                  className="px-6 py-6 rounded-xl font-semibold border-gray-300 text-gray-700"
                  size="lg"
                >
                  Keep
                </Button>
                <Button
                  onClick={onConfirm}
                  isDisabled={isLoading}
                  className={cn(
                    "text-white font-semibold px-8 py-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                    palette.button,
                  )}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="current" size="sm" />
                      <span>{loadingLabel}</span>
                    </div>
                  ) : (
                    <span>{confirmLabel}</span>
                  )}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default function StockTransferPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("list");
  const [activeTab, setActiveTab] = useState("Stock Transfer");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedItems, setSelectedItems] = useState<TransferItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceAutocompleteKey, setSourceAutocompleteKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIncoming, setSelectedIncoming] =
    useState<IncomingTransfer | null>(null);
  const [selectedOutgoing, setSelectedOutgoing] =
    useState<StockTransfer | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [transferPage, setTransferPage] = useState(1);
  const [incomingPage, setIncomingPage] = useState(1);
  const [pageSize] = useState(10);
  const [sendEmailModalOpen, setSendEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [cancellingTransfer, setCancellingTransfer] = useState(false);
  const [deletingTransfer, setDeletingTransfer] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<StockTransfer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockTransfer | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState("");
  const [fetchingTransferDetails, setFetchingTransferDetails] = useState(false);
  const [selectedMailTransferDetails, setSelectedMailTransferDetails] = useState<any>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const currentBusiness = useMemo(
    () => getJsonItemFromLocalStorage("business")?.[0],
    [],
  );
  const currentBusinessId = currentBusiness?.businessId;
  const currentBusinessName = currentBusiness?.businessName || "";
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const { data: incomingData, isLoading: incomingLoading } = useQuery({
    queryKey: ["incomingTransfers", currentBusinessId, incomingPage, pageSize],
    queryFn: async () => {
      const response = await getIncomingTransfers(currentBusinessId, incomingPage, pageSize);
      const responseBody = response?.data;
      const paginated = responseBody?.data;
      const rawItems = paginated?.items ?? [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      return {
        transfers: items.map((o: any) => ({
          id: o.id || "",
          issueDate: o.dateUpdated
            ? new Date(o.dateUpdated).toLocaleDateString("en-GB")
            : "-",
          transferId: o.reference || "",
          receivedFrom: o.sourceBusinessName || "",
          certification:
            o.status === 0
              ? ("Unverified" as const)
              : ("Verified" as const),
          itemCount: o.numberOfItems ?? 0,
          status:
            o.status === 0 ? ("Confirm" as const) : ("Verified" as const),
        })),
        totalCount: paginated?.totalCount ?? items.length,
      };
    },
    enabled: !!currentBusinessId,
    ...fetchQueryConfig(),
  });

  const incomingTransfers: IncomingTransfer[] = incomingData?.transfers ?? [];
  const incomingTotalCount = incomingData?.totalCount ?? 0;

  const { data: transfersResult, isLoading: transfersLoading } = useQuery({
    queryKey: ["stockTransfersByBusiness", currentBusinessId, transferPage, pageSize],
    queryFn: async () => {
      const response = await getStockTransfersByBusiness(currentBusinessId, transferPage, pageSize);
      const paginated = response?.data?.data;
      const rawItems = paginated?.items ?? [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      return { items, totalCount: paginated?.totalCount ?? items.length };
    },
    enabled: !!currentBusinessId,
    ...fetchQueryConfig(),
  });

  const transfersData = transfersResult?.items ?? [];
  const transfersTotalCount = transfersResult?.totalCount ?? 0;

  // Infinite query for Activity Log
  const {
    data: infiniteTransfersResult,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: infiniteTransfersLoading,
  } = useInfiniteQuery({
    queryKey: ["stockTransfersByBusinessInfinite", currentBusinessId, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getStockTransfersByBusiness(currentBusinessId, pageParam, pageSize);
      const paginated = response?.data?.data;
      const rawItems = paginated?.items ?? [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      return {
        items,
        totalCount: paginated?.totalCount ?? items.length,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
    enabled: !!currentBusinessId && activeTab === "Activity Log",
    initialPageParam: 1,
    ...fetchQueryConfig(),
  });

  const infiniteTransfersData = useMemo(() => {
    return infiniteTransfersResult?.pages.flatMap((page) => page.items) ?? [];
  }, [infiniteTransfersResult]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage || activeTab !== "Activity Log") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  const stockTransfers: StockTransfer[] = useMemo(() => {
    if (!transfersData || !Array.isArray(transfersData)) return [];
    return transfersData.map((o: any) => ({
      id: o.id || "",
      issueDate: o.dateUpdated
        ? new Date(o.dateUpdated).toLocaleDateString("en-GB")
        : "-",
      transferId: o.reference || "",
      destinationBusinessName: o.destinationBusinessName || "",
      status:
        o.status === 0
          ? ("Confirmed" as const)
          : o.status === 1
          ? ("In Transit" as const)
          : o.status === 3
          ? ("Cancelled" as const)
          : ("Delivered" as const),
      itemCount: o.numberOfItems ?? 0,
    }));
  }, [transfersData]);

  const activityItems: ActivityLogItem[] = useMemo(() => {
    let sourceData = activeTab === "Activity Log" ? infiniteTransfersData : transfersData;
    
    if (searchQuery) {
      sourceData = sourceData.filter(
        (o: any) =>
          (o.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.destinationBusinessName || "").toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (!sourceData || !Array.isArray(sourceData)) return [];
    return sourceData.map((o: any) => {
      const ref = o.reference || "";
      const dest = o.destinationBusinessName || "";
      const date = o.dateUpdated
        ? new Date(o.dateUpdated).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
      let type: ActivityLogItem["type"] = "created";
      let title = "Transfer Created";
      let description = `Stock Transfer ${ref} created to ${dest}`;
      if (o.status === 1) {
        type = "initiated";
        title = "Transfer Initiated";
        description = `Stock Transfer ${ref} initiated and is in transit to ${dest}`;
      } else if (o.status === 2) {
        type = "completed";
        title = "Transfer Completed";
        description = `Stock Transfer ${ref} delivered to ${dest}`;
      } else if (o.status === 3) {
        type = "unverified";
        title = "Transfer Cancelled";
        description = `Stock Transfer ${ref} to ${dest} was cancelled`;
      }
      return {
        id: o.id || "",
        type,
        title,
        id_tag: ref,
        description,
        timestamp: date,
      };
    });
  }, [transfersData, infiniteTransfersData, activeTab, searchQuery]);

  const {
    data: incomingDetails,
    isLoading: incomingDetailsLoading,
  } = useQuery({
    queryKey: ["stockTransferDetails", selectedIncoming?.id],
    queryFn: async () => {
      const response = await getStockTransferDetails(selectedIncoming!.id);
      return response?.data?.data;
    },
    enabled: !!selectedIncoming,
    ...fetchQueryConfig(),
  });

  const incomingDetailItems = useMemo(() => {
    const details = incomingDetails as any;
    if (!details?.orderDetails) return [];
    return details.orderDetails.map((d: any) => ({
      id: d.sourceInventoryItemID || d.destinationInventoryItemID,
      name: d.sourceInventoryItemName || "",
      destinationName: d.destinationInventoryItemName || "",
      unit: d.inventoryUnitName || "",
      transferQty: d.quantity ?? 0,
      cost: d.itemCost ?? 0,
    }));
  }, [incomingDetails]);

  const transferDetail = incomingDetails as any;

  const {
    data: outgoingDetails,
    isLoading: outgoingDetailsLoading,
  } = useQuery({
    queryKey: ["stockTransferDetails", selectedOutgoing?.id],
    queryFn: async () => {
      const response = await getStockTransferDetails(selectedOutgoing!.id);
      return response?.data?.data;
    },
    enabled: !!selectedOutgoing,
    ...fetchQueryConfig(),
  });

  const outgoingDetailItems = useMemo(() => {
    const details = outgoingDetails as any;
    if (!details?.orderDetails) return [];
    return details.orderDetails.map((d: any) => ({
      id: d.sourceInventoryItemID || d.destinationInventoryItemID,
      name: d.sourceInventoryItemName || "",
      destinationName: d.destinationInventoryItemName || "",
      unit: d.inventoryUnitName || "",
      transferQty: d.quantity ?? 0,
      cost: d.itemCost ?? 0,
    }));
  }, [outgoingDetails]);

  const outgoingDetail = outgoingDetails as any;

  const { data: businessList, isLoading: businessesLoading } =
    useGetBusinessByCooperate();
  const { data: sourceItemsData, isLoading: sourceItemsLoading } =
    useInventoryItems({
      pageSize: 1000,
      businessIdOverride: currentBusinessId,
      enabled: !!currentBusinessId,
    });
  const sourceItems = sourceItemsData || [];

  const { data: destinationItems, isLoading: destinationItemsLoading } =
    useInventoryItems({
      pageSize: 1000,
      businessIdOverride: selectedBusiness || undefined,
      enabled: !!selectedBusiness,
    });

  const businesses = useMemo(() => {
    return (businessList || [])
      .filter((b: any) => b.id !== currentBusinessId)
      .map((b: any) => ({
        label: b.name,
        value: b.id,
      }));
  }, [businessList, currentBusinessId]);

  React.useEffect(() => {
    setSelectedItems([]);
  }, [selectedBusiness]);

  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(
      (t) =>
        t.transferId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destinationBusinessName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, stockTransfers]);

  const filteredIncoming = useMemo(() => {
    return incomingTransfers.filter(
      (t) =>
        t.transferId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.receivedFrom.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, incomingTransfers]);

  const handleCreateNew = () => {
    setStep("select");
  };

  const handleSelectItem = (item: any) => {
    setSelectedItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          unit: item.unitName || "Unit",
          unitCategory: item.unitCategory,
          currentStock: item.stockLevel,
          transferQty: 0,
          cost: item.averageCostPerUnit || 0,
        },
      ];
    });
  };

  const handleUpdateItemDestination = (
    sourceId: string,
    destinationItem: any,
  ) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === sourceId
          ? {
              ...item,
              destinationId: destinationItem.id,
              destinationName: destinationItem.name,
              destinationUnit:
                destinationItem.unitName || destinationItem.unit || item.unit,
            }
          : item,
      ),
    );
  };

  const updateTransferQty = (id: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, transferQty: qty } : item,
      ),
    );
  };

  const handleInitiateTransfer = async () => {
    if (!selectedBusiness || selectedItems.length === 0) {
      notify({
        title: "Error",
        text: "Please select a destination business and at least one item.",
        type: "error",
      });
      return;
    }

    const missingDestinations = selectedItems.filter((i) => !i.destinationId);
    if (missingDestinations.length > 0) {
      notify({
        title: "Error",
        text: "Please map all source items to destination items.",
        type: "error",
      });
      return;
    }

    const invalidQty = selectedItems.filter((i) => i.transferQty <= 0);
    if (invalidQty.length > 0) {
      notify({
        title: "Error",
        text: "Please enter a valid transfer quantity for all items.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const totalAmount = selectedItems.reduce(
        (sum, item) => sum + item.transferQty * item.cost,
        0,
      );

      const payload = {
        destinationBusinessId: selectedBusiness,
        sourceBusinessId: currentBusinessId,
        expectedDate: new Date().toISOString(),
        additionalCostName: "",
        additionalCost: 0,
        totalAmount: totalAmount,
        vatAmount: 0,
        vatRate: 0,
        isVatApplied: false,
        orderDetails: selectedItems.map((item) => ({
          destinationInventoryItemID: item.destinationId!,
          sourceInventoryItemID: item.id,
          quantity: item.transferQty,
          itemCost: item.cost,
        })),
      };

      const response = await createStockTransfer(currentBusinessId, payload);
      if (response?.data?.isSuccessful) {
        notify({
          title: "Success",
          text: "Stock transfer submitted successfully.",
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["stockTransfersByBusiness"] });
        setSelectedItems([]);
        setSelectedBusiness("");
        setStep("list");
      } else {
        notify({
          title: "Error",
          text: response?.data?.error || "Failed to process stock transfer.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error processing transfer:", error);
      notify({
        title: "Error",
        text: "An error occurred while processing the stock transfer.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleProceedToInitiate = () => {
    if (selectedBusiness && selectedItems.length > 0) {
      setStep("initiate");
    }
  };


  const handleConfirmIncoming = async (transferId: string) => {
    setConfirmLoading(true);
    try {
      const response = await confirmStockTransfer(currentBusinessId, transferId);
      if (response?.data?.isSuccessful || response?.status === 200) {
        notify({
          title: "Success",
          text: "Transfer confirmed successfully.",
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["incomingTransfers"] });
        queryClient.invalidateQueries({ queryKey: ["stockTransferDetails", transferId] });
        setSelectedIncoming(null);
      }
    } catch (error) {
      notify({
        title: "Error",
        text: "Failed to confirm transfer. Please try again.",
        type: "error",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelTransfer = async (item: StockTransfer) => {
    setCancellingTransfer(true);
    try {
      const response = await cancelStockTransfer(item.id);
      if (response?.data?.isSuccessful || response?.status === 200) {
        notify({
          title: "Success",
          text: "Stock transfer cancelled successfully.",
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["stockTransfersByBusiness"] });
        setCancelTarget(null);
      } else if (response) {
        notify({
          title: "Error",
          text: response?.data?.error?.responseDescription || "Failed to cancel stock transfer.",
          type: "error",
        });
      }
    } catch {
      // handleError in the API controller already shows an error toast
    } finally {
      setCancellingTransfer(false);
    }
  };

  const handleDeleteTransfer = async (item: StockTransfer) => {
    setDeletingTransfer(true);
    try {
      const response = await deleteStockTransfer(item.id);
      if (response?.data?.isSuccessful || response?.status === 200) {
        notify({
          title: "Success",
          text: "Stock transfer deleted successfully.",
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["stockTransfersByBusiness"] });
        setDeleteTarget(null);
      } else if (response) {
        notify({
          title: "Error",
          text: response?.data?.error?.responseDescription || "Failed to delete stock transfer.",
          type: "error",
        });
      }
    } catch {
      // handleError in the API controller already shows an error toast
    } finally {
      setDeletingTransfer(false);
    }
  };

  const handleSendMailTransfer = async (item: StockTransfer) => {
    setSelectedTransferId(item.id);
    setFetchingTransferDetails(true);
    try {
      const response = await getStockTransferDetails(item.id);
      setSelectedMailTransferDetails(response?.data?.data || null);
    } catch {
      setSelectedMailTransferDetails(null);
    } finally {
      setFetchingTransferDetails(false);
    }
    setSendEmailModalOpen(true);
  };

  const handleSendEmail = async (
    to: string,
    cc: string,
    subject: string,
    message: string,
    attachment: File | null,
  ) => {
    if (!to.trim()) {
      notify({
        title: "Error!",
        text: "Please enter the recipient email address",
        type: "error",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const formData = new FormData();
      formData.append("OrderId", selectedTransferId);
      formData.append("To", to);
      formData.append("From", userInformation?.email || "");
      formData.append("Subject", subject);
      formData.append("Cc", cc.trim());
      formData.append("Content", message);
      if (attachment) {
        formData.append("Attachment", attachment);
      }

      const response = await sendStockTransferMail(formData);
      if (response?.data?.isSuccessful) {
        notify({
          title: "Success!",
          text: "Stock transfer email sent successfully",
          type: "success",
        });
        setSendEmailModalOpen(false);
      } else if (response) {
        notify({
          title: "Error!",
          text: response?.data?.error?.responseDescription || "Failed to send email",
          type: "error",
        });
      }
    } catch {
      // handleError in the API controller already shows an error toast
    } finally {
      setSendingEmail(false);
    }
  };

  const handleBack = () => {
    if (selectedIncoming) {
      setSelectedIncoming(null);
      return;
    }
    if (selectedOutgoing) {
      setSelectedOutgoing(null);
      return;
    }
    if (step === "select") setStep("list");
    else if (step === "initiate") setStep("select");
  };

  const renderStatus = (status: string) => {
    const colors: Record<string, string> = {
      Confirmed: "text-[#16AB60]",
      "In Transit": "text-[#F5A623]",
      Delivered: "text-[#5F35D2]",
      Cancelled: "text-[#D92D20]",
    };
    return (
      <span className={cn("text-sm font-bold", colors[status])}>{status}</span>
    );
  };

  return (
    <div className="w-full min-h-screen">
      {/* Page Header Tabs */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-1">
          {/* Create tab — triggers the create flow (replaces the old right-side button) */}
          <button
            onClick={() => {
              setActiveTab("Stock Transfer");
              setSelectedIncoming(null);
              setSelectedOutgoing(null);
              handleCreateNew();
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              step !== "list"
                ? "bg-[#F0ECFB] text-[#5F35D2]"
                : "text-[#667085] hover:text-[#101828]",
            )}
          >
            <Plus size={16} />
            Create Stock Transfer
          </button>

          {["Stock Transfer", "Incoming", "Activity Log"].map((tab) => {
            const isActive = activeTab === tab && step === "list";
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setStep("list");
                  setSelectedIncoming(null);
                  setSelectedOutgoing(null);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#F0ECFB] text-[#5F35D2]"
                    : "text-[#667085] hover:text-[#101828]",
                )}
              >
                {tab === "Stock Transfer" && (
                  <StockTransferIcon className="w-4 h-4" />
                )}
                {tab === "Incoming" && <IncomingIcon active={isActive} />}
                {tab === "Activity Log" && <ActivityLogIcon active={isActive} />}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {step === "list" && !selectedIncoming && !selectedOutgoing && (
        <div className="px-6 py-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#101828]">
                {activeTab === "Stock Transfer" && "Stock Transfers"}
                {activeTab === "Incoming" && "Incoming Transfers"}
                {activeTab === "Activity Log" && "Activity Log"}
              </h1>
              <p className="text-sm text-[#667085] mt-1">
                {activeTab === "Stock Transfer" &&
                  "Manage inventory movement between business"}
                {activeTab === "Incoming" &&
                  "Confirm stock transferred to your business here."}
                {activeTab === "Activity Log" &&
                  "View stock transfer activity in your business."}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name or ID"
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                endContent={
                  <Search className="w-5 h-5 text-[#98A2B3] cursor-pointer" />
                }
                classNames={{
                  inputWrapper:
                    "bg-white border-[#E4E7EC] h-[48px] rounded-lg px-4 shadow-none",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#3D424A]">
              {activeTab === "Stock Transfer" && ""}
              {activeTab === "Incoming" && ""}
              {activeTab === "Activity Log" && ""}
            </h3>
          </div>

          <div className="relative border border-primaryGrey rounded-lg overflow-visible">
            {activeTab === "Stock Transfer" && (
              <Table
                radius="lg"
                isCompact
                removeWrapper
                classNames={{
                  th: "text-default-500 text-xs border-b border-divider py-4 rounded-none bg-grey300",
                  tr: "border-b border-divider rounded-none",
                  td: "py-3 text-textGrey group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none group-data-[middle=true]:before:rounded-none group-data-[last=true]:first:before:rounded-none group-data-[last=true]:last:before:rounded-none",
                }}
              >
                <TableHeader>
                  <TableColumn>ISSUE DATE</TableColumn>
                  <TableColumn>TRANSFER ID</TableColumn>
                  <TableColumn>DESTINATION</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ITEMS</TableColumn>
                  <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent="No stock transfers found"
                  items={transfersLoading ? [] : filteredTransfers}
                  isLoading={transfersLoading}
                  loadingContent={<SpinnerLoader size="md" />}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="text-sm text-gray-500">{item.issueDate}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{item.transferId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {item.destinationBusinessName}
                        </span>
                      </TableCell>
                      <TableCell>{renderStatus(item.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{item.itemCount}</span>
                      </TableCell>
                      <TableCell>
                        <div
                          className="relative flex justify-center items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Dropdown>
                            <DropdownTrigger>
                              <button
                                type="button"
                                aria-label="actions"
                                className="cursor-pointer flex items-center gap-0.5 text-gray-500 hover:text-black transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                              >
                                <HiOutlineDotsVertical />
                              </button>
                            </DropdownTrigger>
                            <DropdownMenu
                              className="text-black"
                              onAction={(key) => {
                                if (key === "view") {
                                  setSelectedOutgoing(item);
                                } else if (key === "sendEmail") {
                                  handleSendMailTransfer(item);
                                } else if (key === "cancel") {
                                  setCancelTarget(item);
                                } else if (key === "delete") {
                                  setDeleteTarget(item);
                                }
                              }}
                            >
                              <DropdownSection>
                                <DropdownItem key="view">
                                  <div className="flex gap-3 items-center">
                                    <Eye size={16} />
                                    <p>View Details</p>
                                  </div>
                                </DropdownItem>
                                <DropdownItem key="sendEmail">
                                  <div className="flex gap-3 items-center">
                                    <Mail size={16} />
                                    <p>Send Email</p>
                                  </div>
                                </DropdownItem>
                                <DropdownItem key="cancel">
                                  <div className="flex gap-3 items-center">
                                    <XCircle size={16} />
                                    <p>Cancel</p>
                                  </div>
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                >
                                  <div className="flex gap-3 items-center">
                                    <Trash2 size={16} />
                                    <p>Delete</p>
                                  </div>
                                </DropdownItem>
                              </DropdownSection>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "Incoming" && (
              <Table
                aria-label="Incoming Transfers List"
                radius="lg"
                isCompact
                removeWrapper
                classNames={{
                  th: "text-default-500 text-xs border-b border-divider py-4 rounded-none bg-grey300",
                  tr: "border-b border-divider rounded-none",
                  td: "py-3 text-textGrey group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none group-data-[middle=true]:before:rounded-none group-data-[last=true]:first:before:rounded-none group-data-[last=true]:last:before:rounded-none",
                }}
              >
                <TableHeader>
                  <TableColumn>ISSUE DATE</TableColumn>
                  <TableColumn>TRANSFER ID</TableColumn>
                  <TableColumn>RECEIVED FROM</TableColumn>
                  <TableColumn>ITEMS</TableColumn>
                  <TableColumn align="center">STATUS</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent="No incoming transfers found"
                  items={incomingLoading ? [] : filteredIncoming}
                  isLoading={incomingLoading}
                  loadingContent={<SpinnerLoader size="md" />}
                >
                  {(transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <span className="text-sm text-gray-500">{transfer.issueDate}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{transfer.transferId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{transfer.receivedFrom}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{transfer.itemCount}</span>
                      </TableCell>
                      <TableCell>
                        {transfer.status === "Confirm" ? (
                          <Button
                            size="sm"
                            onClick={() => setSelectedIncoming(transfer)}
                            className="bg-[#5F35D2] text-white rounded-xl font-bold flex items-center gap-2 h-10 px-6"
                            endContent={
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            }
                          >
                            Confirm
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-[#16AB60] font-bold">
                            Verified
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.75 12.75L10 15L16.25 8.75"
                                stroke="#16AB60"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="#16AB60"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "Activity Log" && (
              <div className="flex flex-col gap-6 p-8 min-h-[400px]">
                {activityItems.length > 0 ? (
                  activityItems.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 pb-6 border-b border-[#F2F4F7] last:border-0"
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full mt-1.5 shrink-0 transition-colors",
                          activity.type === "created" && "bg-[#5F35D2]",
                          activity.type === "initiated" && "bg-[#5F35D2]",
                          activity.type === "completed" && "bg-[#16AB60]",
                          activity.type === "unverified" && "bg-[#F5A623]",
                        )}
                      />
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-[#101828] font-bold text-lg">
                            {activity.title}
                          </span>
                          <span className="bg-[#E4E7EC] text-[#667085] text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {activity.id_tag}
                          </span>
                        </div>
                        <p className="text-[#667085] text-sm">
                          {activity.description}
                        </p>
                        <span className="text-[#98A2B3] text-xs font-medium uppercase">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  !infiniteTransfersLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-[#667085]">
                      <p>No activity logs found</p>
                    </div>
                  )
                )}

                {(infiniteTransfersLoading || isFetchingNextPage) && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5F35D2]" />
                  </div>
                )}

                <div ref={loadMoreRef} className="h-4" />
              </div>
            )}

            {activeTab === "Stock Transfer" && (
              <div className="flex w-full justify-center">
                <CustomPagination
                  currentPage={transferPage}
                  totalPages={Math.ceil(transfersTotalCount / pageSize) || 1}
                  hasNext={transferPage < (Math.ceil(transfersTotalCount / pageSize) || 1)}
                  hasPrevious={transferPage > 1}
                  totalCount={transfersTotalCount}
                  pageSize={pageSize}
                  onPageChange={setTransferPage}
                  onNext={() => setTransferPage(Math.min(transferPage + 1, Math.ceil(transfersTotalCount / pageSize) || 1))}
                  onPrevious={() => setTransferPage(Math.max(transferPage - 1, 1))}
                  isLoading={transfersLoading}
                />
              </div>
            )}
            {activeTab === "Incoming" && (
              <div className="flex w-full justify-center">
                <CustomPagination
                  currentPage={incomingPage}
                  totalPages={Math.ceil(incomingTotalCount / pageSize) || 1}
                  hasNext={incomingPage < (Math.ceil(incomingTotalCount / pageSize) || 1)}
                  hasPrevious={incomingPage > 1}
                  totalCount={incomingTotalCount}
                  pageSize={pageSize}
                  onPageChange={setIncomingPage}
                  onNext={() => setIncomingPage(Math.min(incomingPage + 1, Math.ceil(incomingTotalCount / pageSize) || 1))}
                  onPrevious={() => setIncomingPage(Math.max(incomingPage - 1, 1))}
                  isLoading={incomingLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {step === "select" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#344054]" />
              </button>
              <h1 className="text-[20px] font-bold text-[#101828]">
                Select destination business and items
              </h1>
            </div>
            <div className="text-sm font-semibold text-[#98A2B3]">1 of 2</div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white p-8 rounded-2xl border border-[#E4E7EC] shadow-sm flex flex-col gap-4">
              <p className="text-sm font-bold text-[#344054]">
                Select Store/Business you wish to send stock
              </p>
              <Select
                placeholder="Select Business"
                isLoading={businessesLoading}
                isDisabled={!businessesLoading && businesses.length === 0}
                selectedKeys={selectedBusiness ? [selectedBusiness] : []}
                onSelectionChange={(keys) =>
                  setSelectedBusiness(Array.from(keys)[0] as string)
                }
                variant="bordered"
                className="w-full"
                selectorIcon={
                  <ChevronDown className="w-5 h-5 text-[#667085]" />
                }
                classNames={{
                  trigger:
                    "h-[56px] bg-[#F2F4F7] border-none rounded-lg px-6 text-[#101828] font-medium shadow-none",
                }}
              >
                {businesses.map((b) => (
                  <SelectItem
                    className="text-[#344054]"
                    key={b.value}
                    value={b.value}
                  >
                    {b.label}
                  </SelectItem>
                ))}
              </Select>
              {!businessesLoading && businesses.length === 0 && (
                <p className="text-xs text-[#98A2B3] italic">
                  No other businesses available to receive a transfer.
                </p>
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E4E7EC] shadow-sm flex flex-col gap-6">
              <div className="relative">
                <Autocomplete
                  key={sourceAutocompleteKey}
                  placeholder="Search and add Items"
                  variant="bordered"
                  isLoading={sourceItemsLoading}
                  isDisabled={!selectedBusiness}
                  classNames={{
                    base: "w-full",
                    listboxWrapper: "max-h-[300px]",
                  }}
                  inputProps={{
                    classNames: {
                      inputWrapper:
                        "bg-[#F2F4F7] border-none h-[56px] rounded-lg px-6 shadow-none",
                      input:
                        "text-[#101828] font-medium placeholder:text-[#98A2B3] text-sm",
                    },
                  }}
                  listboxProps={{
                    emptyContent: !selectedBusiness
                      ? "Select a destination business first"
                      : "No items with available stock",
                  }}
                  onSelectionChange={(key) => {
                    if (key) {
                      const item = (sourceItems || []).find(
                        (i: any) => i.id === key,
                      );
                      if (item) {
                        handleSelectItem(item);
                        setSourceAutocompleteKey((k) => k + 1);
                      }
                    }
                  }}
                  selectorIcon={<Search className="w-5 h-5 text-[#98A2B3]" />}
                >
                  {(sourceItems || [])
                    .filter(
                      (item: any) =>
                        !selectedItems.find((i) => i.id === item.id) &&
                        Number(item.stockLevel) > 0,
                    )
                    .map((item: any) => (
                      <AutocompleteItem
                        key={item.id}
                        value={item.id}
                        textValue={item.name}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#101828]">
                            {item.name}
                          </span>
                          <span className="text-xs text-[#667085]">
                            Stock: {item.stockLevel} {item.unitName || "Units"}
                          </span>
                        </div>
                      </AutocompleteItem>
                    ))}
                </Autocomplete>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedItems.map((item) => (
                  <Chip
                    key={item.id}
                    onClose={() => removeItem(item.id)}
                    className="bg-[#EAE3FF] text-[#5F35D2] px-4 py-7 rounded-full font-bold border-none"
                    classNames={{
                      closeButton: "text-[#5F35D2] hover:bg-transparent",
                    }}
                  >
                    {item.name}
                  </Chip>
                ))}
                {selectedItems.length === 0 && (
                  <div className="w-full py-6 text-center text-[#98A2B3] italic text-sm">
                    Search and select items to transfer
                  </div>
                )}
              </div>

              <Button
                isDisabled={!selectedBusiness || selectedItems.length === 0}
                onClick={handleProceedToInitiate}
                className={cn(
                  "w-full rounded-xl py-5 font-bold text-base gap-3 transition-all",
                  selectedBusiness && selectedItems.length > 0
                    ? "bg-[#5F35D2] text-white shadow-none"
                    : "bg-[#D0D5DD] text-[#98A2B3]",
                )}
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "initiate" && (
        <div className="flex flex-col gap-6 px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#344054]" />
              </button>
              <h1 className="text-[20px] font-bold text-[#101828]">
                Submit Stock Transfer
              </h1>
            </div>
            <div className="text-sm font-semibold text-[#98A2B3]">2 of 2</div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 font-medium text-[#667085]">
            <span className="text-[#101828] font-bold">
              {currentBusinessName}
            </span>
            <ArrowRight className="w-3 h-3" strokeWidth={3} />
            <span className="text-[#101828] font-bold">
              {businesses.find((b) => b.value === selectedBusiness)?.label}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden w-full relative">
                <Table
                  aria-label="Initiate Transfer List"
                  removeWrapper
                  classNames={{
                    th: "bg-[#F9FAFB] text-[#667085] font-bold text-[10px] py-5 px-6 uppercase tracking-wider",
                    td: "py-5 px-6 text-sm text-[#344054] border-b border-[#F2F4F7] font-bold relative",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Item Name (Source)</TableColumn>
                    <TableColumn align="center"> </TableColumn>
                    <TableColumn>Item Name (Destination)</TableColumn>
                    <TableColumn>Item Unit</TableColumn>
                    <TableColumn>Transfer QTy</TableColumn>
                    <TableColumn align="center"> </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-[#101828]">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <SwapIcon />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            placeholder="Search Item name"
                            variant="bordered"
                            isLoading={destinationItemsLoading}
                            defaultSelectedKey={item.destinationId}
                            listboxProps={{
                              emptyContent:
                                item.unitCategory == null
                                  ? "Source item has no unit category"
                                  : "No compatible destination items",
                            }}
                            onSelectionChange={(key) => {
                              if (key) {
                                const destItem = (destinationItems || []).find(
                                  (i: any) => i.id === key,
                                );
                                if (destItem) {
                                  handleUpdateItemDestination(
                                    item.id,
                                    destItem,
                                  );
                                }
                              }
                            }}
                            classNames={{
                              base: "min-w-[180px]",
                              listboxWrapper: "max-h-[200px]",
                            }}
                            inputProps={{
                              classNames: {
                                inputWrapper: cn(
                                  "bg-[#F2F4F7] h-[44px] rounded-lg px-3 shadow-none border-dashed border-[#D0D5DD]",
                                  item.destinationName
                                    ? "border-none"
                                    : "border",
                                ),
                                input:
                                  "text-[#101828] font-medium placeholder:text-[#98A2B3] text-sm",
                              },
                            }}
                            selectorIcon={
                              <Search className="w-4 h-4 text-[#98A2B3]" />
                            }
                          >
                            {(destinationItems || [])
                              .filter((destItem: any) => {
                                if (
                                  item.unitCategory == null ||
                                  destItem.unitCategory == null
                                ) {
                                  return false;
                                }
                                return (
                                  destItem.unitCategory === item.unitCategory
                                );
                              })
                              .map((destItem: any) => (
                              <AutocompleteItem
                                key={destItem.id}
                                value={destItem.id}
                                textValue={destItem.name}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-[#101828]">
                                    {destItem.name}
                                  </span>
                                  {(destItem.unitName || destItem.unit) && (
                                    <span className="text-xs text-[#667085]">
                                      Unit: {destItem.unitName || destItem.unit}
                                    </span>
                                  )}
                                </div>
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                        </TableCell>
                        <TableCell>
                          {item.destinationUnit || item.unit}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.transferQty.toString()}
                            onValueChange={(val) =>
                              updateTransferQty(item.id, Number(val))
                            }
                            classNames={{
                              input: "text-center font-bold text-[#101828]",
                              inputWrapper:
                                "w-20 bg-transparent border-none shadow-none",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#D0D5DD] hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-6 rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col gap-6">
                <h3 className="text-[24px] font-bold text-[#475467] text-center">
                  Summary
                </h3>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Source:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {currentBusinessName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Destination:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {
                        businesses.find((b) => b.value === selectedBusiness)
                          ?.label
                      }
                    </span>
                  </div>
                  <div className="h-[1px] bg-[#F2F4F7] w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Number of Items:
                    </span>
                    <span className="font-bold text-[#101828] text-base">
                      {selectedItems.length}
                    </span>
                  </div>
                  {selectedItems.length > 0 && (
                    <>
                      <div className="h-[1px] bg-[#F2F4F7] w-full" />
                      <div className="flex flex-col gap-2">
                        {selectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-[#667085] font-medium truncate max-w-[180px]">
                              {item.name}
                            </span>
                            <span className="font-bold text-[#101828]">
                              {item.transferQty} {item.destinationUnit || item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => handleInitiateTransfer()}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    className="w-full bg-[#5F35D2] text-white rounded-lg py-4 font-bold text-sm gap-3 shadow-none"
                    endContent={
                      !isLoading ? (
                        <ArrowRight className="w-4 h-4" />
                      ) : null
                    }
                  >
                    Submit Stock Transfer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedOutgoing && (
        <div className="flex flex-col gap-6 px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#344054]" />
                </button>
                <h1 className="text-[20px] font-bold text-[#101828]">
                  Stock Transfer
                </h1>
              </div>
              {selectedOutgoing.status === "Delivered" && (
                <div className="flex items-center gap-2 text-[#5F35D2] bg-[#F3EEFF] px-4 py-2 rounded-full border border-[#5F35D2]">
                  <span className="text-sm font-bold">Delivered</span>
                </div>
              )}
              {selectedOutgoing.status === "In Transit" && (
                <div className="flex items-center gap-2 text-[#F5A623] bg-[#FFF8EB] px-4 py-2 rounded-full border border-[#F5A623]">
                  <span className="text-sm font-bold">In Transit</span>
                </div>
              )}
              {selectedOutgoing.status === "Confirmed" && (
                <div className="flex items-center gap-2 text-[#16AB60] bg-[#ECFDF3] px-4 py-2 rounded-full border border-[#16AB60]">
                  <span className="text-sm font-bold">Confirmed</span>
                </div>
              )}
              {selectedOutgoing.status === "Cancelled" && (
                <div className="flex items-center gap-2 text-[#D92D20] bg-[#FEF3F2] px-4 py-2 rounded-full border border-[#D92D20]">
                  <span className="text-sm font-bold">Cancelled</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mt-1.5 font-medium text-[#667085]">
              <span className="text-[#101828] font-bold">
                {currentBusinessName}
              </span>
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
              <span className="text-[#101828] font-bold">
                {selectedOutgoing.destinationBusinessName}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden w-full relative">
              {outgoingDetailsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F35D2]" />
                </div>
              ) : (
              <Table
                aria-label="View Transfer List"
                removeWrapper
                classNames={{
                  th: "bg-[#F9FAFB] text-[#667085] font-bold text-[10px] py-4 px-6 uppercase tracking-wider",
                  td: "py-4 px-6 text-sm text-[#344054] border-b border-[#F2F4F7] font-bold relative",
                }}
              >
                <TableHeader>
                  <TableColumn>Item Name (Source)</TableColumn>
                  <TableColumn align="center"> </TableColumn>
                  <TableColumn>Item Name (Destination)</TableColumn>
                  <TableColumn>Item Unit</TableColumn>
                  <TableColumn>Transfer Quantity</TableColumn>
                  <TableColumn>Item Cost</TableColumn>
                </TableHeader>
                <TableBody>
                  {outgoingDetailItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-[#101828]">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <SwapIcon />
                      </TableCell>
                      <TableCell>
                        <span className="text-[#101828]">
                          {item.destinationName || item.name}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <span className="text-[#101828] ml-8 font-bold">
                          {item.transferQty || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#101828]">
                          {item.cost?.toLocaleString("en-NG", { style: "currency", currency: "NGN" }) || "₦0.00"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-6 rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col gap-6">
                <h3 className="text-[24px] font-bold text-[#475467] text-center">
                  Summary
                </h3>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Source:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {currentBusinessName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Destination:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {outgoingDetail?.destinationBusinessName || selectedOutgoing.destinationBusinessName}
                    </span>
                  </div>
                  {outgoingDetail?.destinationBusinessAddress && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Address:
                      </span>
                      <span className="font-bold text-[#475467] text-right max-w-[180px]">
                        {outgoingDetail.destinationBusinessAddress}
                      </span>
                    </div>
                  )}
                  {outgoingDetail?.destinationBusinessEmail && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Email:
                      </span>
                      <span className="font-bold text-[#475467] text-right max-w-[180px] truncate">
                        {outgoingDetail.destinationBusinessEmail}
                      </span>
                    </div>
                  )}
                  {outgoingDetail?.reference && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Reference:
                      </span>
                      <span className="font-bold text-[#475467]">
                        {outgoingDetail.reference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">Status:</span>
                    <span className={cn(
                      "font-bold",
                      selectedOutgoing.status === "In Transit" && "text-[#F5A623]",
                      selectedOutgoing.status === "Delivered" && "text-[#5F35D2]",
                      selectedOutgoing.status === "Confirmed" && "text-[#16AB60]",
                      selectedOutgoing.status === "Cancelled" && "text-[#D92D20]",
                    )}>
                      {selectedOutgoing.status}
                    </span>
                  </div>
                  {outgoingDetail?.orderDate && outgoingDetail.orderDate !== "0001-01-01T00:00:00" && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Order Date:
                      </span>
                      <span className="font-bold text-[#475467]">
                        {new Date(outgoingDetail.orderDate).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}
                  {outgoingDetail?.expectedDate && outgoingDetail.expectedDate !== "0001-01-01T00:00:00" && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Expected Date:
                      </span>
                      <span className="font-bold text-[#475467]">
                        {new Date(outgoingDetail.expectedDate).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}
                  <div className="h-[1px] bg-[#F2F4F7] w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Number of Items:
                    </span>
                    <span className="font-bold text-[#101828] text-base">
                      {outgoingDetailItems.length || selectedOutgoing.itemCount}
                    </span>
                  </div>
                  {outgoingDetail?.additionalCostName && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        {outgoingDetail.additionalCostName}:
                      </span>
                      <span className="font-bold text-[#475467]">
                        {outgoingDetail.additionalCost?.toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                      </span>
                    </div>
                  )}
                  {outgoingDetail?.isVatApplied && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        VAT ({outgoingDetail.vatRate}%):
                      </span>
                      <span className="font-bold text-[#475467]">
                        {outgoingDetail.vatAmount?.toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                      </span>
                    </div>
                  )}
                  {(outgoingDetail?.subTotalAmount > 0 || outgoingDetail?.totalAmount > 0) && (
                    <>
                      <div className="h-[1px] bg-[#F2F4F7] w-full" />
                      {outgoingDetail?.subTotalAmount > 0 && outgoingDetail?.subTotalAmount !== outgoingDetail?.totalAmount && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#667085] font-medium">
                            Sub Total:
                          </span>
                          <span className="font-bold text-[#475467]">
                            {outgoingDetail.subTotalAmount?.toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-[#667085] font-medium">
                          Total Amount:
                        </span>
                        <span className="font-bold text-[#101828] text-base">
                          {outgoingDetail.totalAmount?.toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedIncoming && (
        <div className="flex flex-col gap-6 px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#344054]" />
                </button>
                <h1 className="text-[20px] font-bold text-[#101828]">
                  Stock Transfer
                </h1>
              </div>
              {selectedIncoming.status === "Verified" && (
                <div className="flex items-center gap-2 text-[#16AB60] bg-[#EBFFF5] px-4 py-2 rounded-full border border-[#16AB60]">
                  <span className="text-sm font-bold">Verified</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.75 12.75L10 15L16.25 8.75"
                      stroke="#16AB60"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#16AB60"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mt-1.5 font-medium text-[#667085]">
              <span className="text-[#101828] font-bold">
                {selectedIncoming.receivedFrom}
              </span>
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
              <span className="text-[#101828] font-bold">
                {transferDetail?.destinationBusinessName || currentBusinessName}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden w-full">
              {incomingDetailsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F35D2]" />
                </div>
              ) : (
              <div className="max-h-[60vh] overflow-y-auto">
              <Table
                aria-label="View Transfer List"
                removeWrapper
                classNames={{
                  th: "bg-[#F9FAFB] text-[#667085] font-bold text-[10px] py-4 px-6 uppercase tracking-wider sticky top-0 z-10",
                  td: "py-4 px-6 text-sm text-[#344054] border-b border-[#F2F4F7] font-bold relative",
                }}
              >
                <TableHeader>
                  <TableColumn>Item Name (Source)</TableColumn>
                  <TableColumn align="center"> </TableColumn>
                  <TableColumn>Item Name (Destination)</TableColumn>
                  <TableColumn>Item Unit</TableColumn>
                  <TableColumn>Transfer Quantity</TableColumn>
                </TableHeader>
                <TableBody>
                  {incomingDetailItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-[#101828]">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <SwapIcon />
                      </TableCell>
                      <TableCell>
                        <span className="text-[#101828]">
                          {item.destinationName || item.name}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <span className="text-[#101828] ml-8 font-bold">
                          {item.transferQty || 0}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              )}
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-6 rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col gap-6">
                <h3 className="text-[24px] font-bold text-[#475467] text-center">
                  Summary
                </h3>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Source:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {selectedIncoming.receivedFrom}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Destination:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {transferDetail?.destinationBusinessName || currentBusinessName}
                    </span>
                  </div>
                  {transferDetail?.reference && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Reference:
                      </span>
                      <span className="font-bold text-[#475467]">
                        {transferDetail?.reference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">Status:</span>
                    <span className={cn(
                      "font-bold",
                      transferDetail?.status === 0 ? "text-[#101828]" : "text-[#16AB60]",
                    )}>
                      {transferDetail?.status === 0 ? "Pending" : "Completed"}
                    </span>
                  </div>
                  <div className="h-[1px] bg-[#F2F4F7] w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Number of Items:
                    </span>
                    <span className="font-bold text-[#101828] text-base">
                      {incomingDetailItems.length || selectedIncoming.itemCount}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {selectedIncoming.status === "Confirm" && (
                    <Button
                      onClick={() => handleConfirmIncoming(selectedIncoming.id)}
                      isLoading={confirmLoading}
                      isDisabled={confirmLoading}
                      className="w-full bg-[#5F35D2] text-white rounded-lg py-4 font-bold text-sm gap-3 shadow-none"
                      endContent={
                        !confirmLoading ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        ) : undefined
                      }
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SendEmailModal
        isOpen={sendEmailModalOpen}
        onOpenChange={setSendEmailModalOpen}
        supplierEmail=""
        businessName={currentBusinessName}
        onSend={handleSendEmail}
        isLoading={sendingEmail}
        stockTransferData={selectedMailTransferDetails}
        title="Send Stock Transfer Email"
        subtitle="Notify the recipient about this stock transfer"
        emailPlaceholder="recipient@email.com"
        defaultSubject="Stock Transfer"
        messagePlaceholder="Add a message to the recipient..."
      />

      <ConfirmActionModal
        isOpen={!!cancelTarget}
        onClose={() => !cancellingTransfer && setCancelTarget(null)}
        onConfirm={() => cancelTarget && handleCancelTransfer(cancelTarget)}
        isLoading={cancellingTransfer}
        title="Cancel Stock Transfer"
        message={
          <>
            Are you sure you want to cancel{" "}
            <span className="font-semibold text-[#101828]">
              {cancelTarget?.transferId || "this transfer"}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Yes, Cancel Transfer"
        loadingLabel="Cancelling..."
        tone="warning"
      />

      <ConfirmActionModal
        isOpen={!!deleteTarget}
        onClose={() => !deletingTransfer && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteTransfer(deleteTarget)}
        isLoading={deletingTransfer}
        title="Delete Stock Transfer"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#101828]">
              {deleteTarget?.transferId || "this transfer"}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Yes, Delete"
        loadingLabel="Deleting..."
        tone="danger"
      />
    </div>
  );
}
