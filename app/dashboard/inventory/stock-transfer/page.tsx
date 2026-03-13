"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { StockTransferIcon } from "@/public/assets/svg";
import { cn, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import useInventoryItems, {
  useIngredients,
} from "@/hooks/cachedEndpoints/useInventoryItems";
import {
  createStockTransfer,
  getIncomingTransfers,
  getStockTransferDetails,
  getStockTransfersByBusiness,
  confirmStockTransfer,
} from "@/app/api/controllers/dashboard/inventory";
import { fetchQueryConfig } from "@/lib/queryConfig";

type Step = "list" | "select" | "initiate";

interface StockTransfer {
  id: string;
  issueDate: string;
  transferId: string;
  route: string;
  status: "Draft" | "In Transit" | "Delivered";
  staff: string;
  itemCount: number;
  certification: "Pending" | "Unverified" | "Verified";
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
  currentStock: number;
  transferQty: number;
  cost: number;
  destinationId?: string;
  destinationName?: string;
  destinationUnit?: string;
}

const mockTransfers: StockTransfer[] = [
  {
    id: "1",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    route: "Maryland Business → Ikeja Business",
    status: "Draft",
    staff: "Esther O.",
    itemCount: 7,
    certification: "Pending",
  },
  {
    id: "2",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    route: "Maryland Business → Lekki 1 Business",
    status: "In Transit",
    staff: "David K.",
    itemCount: 5,
    certification: "Pending",
  },
  {
    id: "3",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    route: "Maryland Business → Ajah Business",
    status: "In Transit",
    staff: "Sophia B.",
    itemCount: 12,
    certification: "Pending",
  },
  {
    id: "4",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    route: "Maryland Business → Victoria Island B...",
    status: "Delivered",
    staff: "Akin J.",
    itemCount: 9,
    certification: "Unverified",
  },
  {
    id: "5",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    route: "Maryland Business → Ikoyi Business",
    status: "Delivered",
    staff: "Manuel",
    itemCount: 5,
    certification: "Verified",
  },
];


const mockActivities: ActivityLogItem[] = [
  {
    id: "1",
    type: "created",
    title: "Transfer Created",
    id_tag: "4241STR",
    description:
      "Stock Transfer 4241STR created from Maryland Business To Victoria Island Business",
    timestamp: "March 2, 2026 09:35am",
  },
  {
    id: "2",
    type: "initiated",
    title: "Transfer Initiated",
    id_tag: "4241STR",
    description:
      "Stock Transfer 4241STR initiated and is in transit to Victoria Island Business",
    timestamp: "March 2, 2026 09:35am",
  },
  {
    id: "3",
    type: "completed",
    title: "Transfer Completed",
    id_tag: "4241STR",
    description:
      "Stock Transfer 4241STR receipt confirmed by Victoria Island Business",
    timestamp: "March 2, 2026 09:35am",
  },
  {
    id: "4",
    type: "unverified",
    title: "Transfer Completed (Unverified)",
    id_tag: "4241STR",
    description:
      "Stock Transfer 4241STR completed without confirmation from To Victoria Island Business",
    timestamp: "March 2, 2026 09:35am",
  },
];

const mockItems: TransferItem[] = [
  {
    id: "1",
    name: "Gino Tin Tomato Paste",
    unit: "Kg",
    currentStock: 35,
    transferQty: 0,
    destinationName: "Gino Tomato Paste",
  },
  {
    id: "2",
    name: "Knoll Seasoning Cubes",
    unit: "Kg",
    currentStock: 40,
    transferQty: 0,
    destinationName: "Knoll Seasoning Cubes",
  },
  {
    id: "3",
    name: "Golden Penny Salt",
    unit: "Kg",
    currentStock: 27,
    transferQty: 0,
    destinationName: "Golden Penny Salt",
  },
  {
    id: "4",
    name: "Golden Penny Long Grain Rice",
    unit: "Kg",
    currentStock: 15,
    transferQty: 0,
    destinationName: "Golden Penny Rice",
  },
  {
    id: "5",
    name: "Golden Penny Spaghetti",
    unit: "Kg",
    currentStock: 7,
    transferQty: 0,
  },
  {
    id: "6",
    name: "Kings Vegetable Oil",
    unit: "Lt",
    currentStock: 10,
    transferQty: 0,
  },
];

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

export default function StockTransferPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("list");
  const [activeTab, setActiveTab] = useState("Stock Transfer");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedItems, setSelectedItems] = useState<TransferItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [destSearchQuery, setDestSearchQuery] = useState("");
  const [transferStage, setTransferStage] = useState(1); // 1: Initial, 2: In-Transit, 3: Delivered, 4: Verified, 5: Completed
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIncoming, setSelectedIncoming] =
    useState<IncomingTransfer | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const currentBusiness = useMemo(
    () => getJsonItemFromLocalStorage("business")?.[0],
    [],
  );
  const currentBusinessId = currentBusiness?.businessId;
  const currentBusinessName = currentBusiness?.name || "Current Business";

  const { data: incomingData, isLoading: incomingLoading } = useQuery({
    queryKey: ["incomingTransfers", currentBusinessId],
    queryFn: async () => {
      const response = await getIncomingTransfers(currentBusinessId);
      const responseBody = response?.data;
      const paginated = responseBody?.data;
      const rawItems = paginated?.items ?? [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      return items.map((o: any) => ({
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
      }));
    },
    enabled: !!currentBusinessId,
    ...fetchQueryConfig(),
  });

  const incomingTransfers: IncomingTransfer[] = Array.isArray(incomingData) ? incomingData : [];

  const { data: transfersData, isLoading: transfersLoading } = useQuery({
    queryKey: ["stockTransfersByBusiness", currentBusinessId],
    queryFn: async () => {
      const response = await getStockTransfersByBusiness(currentBusinessId);
      const paginated = response?.data?.data;
      const rawItems = paginated?.items ?? [];
      return Array.isArray(rawItems) ? rawItems : [];
    },
    enabled: !!currentBusinessId,
    ...fetchQueryConfig(),
  });

  const stockTransfers: StockTransfer[] = useMemo(() => {
    if (!transfersData || !Array.isArray(transfersData)) return [];
    return transfersData.map((o: any) => ({
      id: o.id || "",
      issueDate: o.dateUpdated
        ? new Date(o.dateUpdated).toLocaleDateString("en-GB")
        : "-",
      transferId: o.reference || "",
      route: `${currentBusinessName} → ${o.destinationBusinessName || ""}`,
      status:
        o.status === 0
          ? ("Draft" as const)
          : o.status === 1
            ? ("In Transit" as const)
            : ("Delivered" as const),
      staff: "-",
      itemCount: o.numberOfItems ?? 0,
      certification:
        o.status === 0
          ? ("Pending" as const)
          : o.status === 1
            ? ("Pending" as const)
            : ("Unverified" as const),
    }));
  }, [transfersData, currentBusinessName]);

  const activityItems: ActivityLogItem[] = useMemo(() => {
    if (!transfersData || !Array.isArray(transfersData)) return [];
    return transfersData.map((o: any) => {
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
  }, [transfersData]);

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

  const { data: businessList, isLoading: businessesLoading } =
    useGetBusinessByCooperate();
  const { data: sourceItemsData, isLoading: sourceItemsLoading } =
    useInventoryItems({
      pageSize: 1000,
      businessIdOverride: currentBusinessId,
    });
  const sourceItems = sourceItemsData || [];

  const { data: destinationItems, isLoading: destinationItemsLoading } =
    useIngredients({
      businessId: selectedBusiness,
      search: destSearchQuery,
      enabled: step === "initiate" && !!selectedBusiness,
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

  React.useEffect(() => {
    if (step === "initiate" && transferStage === 1) {
      console.log("On 'Initiate or save transfer' step:");
      console.log("Current Business ID:", currentBusinessId);
      console.log("Selected Business ID (Destination):", selectedBusiness);
      console.log("Search Query/Business ID from search:", searchQuery);
    }
  }, [step, transferStage, currentBusinessId, selectedBusiness, searchQuery]);

  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(
      (t) =>
        t.transferId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.route.toLowerCase().includes(searchQuery.toLowerCase()),
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
    if (!selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          name: item.name,
          unit: item.unitName || "Unit",
          currentStock: item.stockLevel,
          transferQty: 0,
          cost: item.averageCostPerUnit || 0,
        },
      ]);
    }
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

  const handleInitiateTransfer = async (isVerification = false) => {
    console.log("Current Business ID:", currentBusinessId);
    console.log("Selected Business ID (Destination):", selectedBusiness);
    console.log("Search Query/Business ID from search:", searchQuery);

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
          text: isVerification
            ? "Stock transfer verified successfully."
            : "Stock transfer initiated successfully.",
          type: "success",
        });
        if (isVerification) {
          setTransferStage(5); // Move to Completed stage
        } else {
          setTransferStage(2); // Move to In-Transit stage
        }
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
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const handleProceedToInitiate = () => {
    if (selectedBusiness && selectedItems.length > 0) {
      console.log(
        "Proceeding to Initiate - Current Business ID:",
        currentBusinessId,
      );
      console.log(
        "Proceeding to Initiate - Selected Business ID (Destination):",
        selectedBusiness,
      );
      console.log(
        "Proceeding to Initiate - Search Query/Business ID from search:",
        searchQuery,
      );
      setStep("initiate");
    }
  };

  const handleSaveDraft = () => {
    console.log("Saving Draft - Current Business ID:", currentBusinessId);
    console.log(
      "Saving Draft - Selected Business ID (Destination):",
      selectedBusiness,
    );
    console.log(
      "Saving Draft - Search Query/Business ID from search:",
      searchQuery,
    );
    notify({
      title: "Success",
      text: "Transfer saved as draft.",
      type: "success",
    });
    setStep("list");
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

  const handleBack = () => {
    if (selectedIncoming) {
      setSelectedIncoming(null);
      return;
    }
    if (step === "select") setStep("list");
    else if (step === "initiate") {
      if (transferStage > 1) {
        setTransferStage(transferStage - 1);
      } else {
        setStep("select");
      }
    }
  };

  const ProgressIndicator = ({ currentStage }: { currentStage: number }) => {
    const stages = ["Created", "Initiated", "Delivered", "Verified"];

    return (
      <div className="flex items-center gap-2 mb-8 mt-4 overflow-x-auto">
        {stages.map((label, index) => {
          const isActive = index < currentStage;
          const isLast = index === stages.length - 1;

          return (
            <div key={label} className="flex items-center flex-1 min-w-[150px]">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full transition-all",
                      isActive ? "bg-[#16AB60]" : "bg-[#D0D5DD]",
                    )}
                  />
                  {!isLast && (
                    <div
                      className={cn(
                        "h-[2px] flex-1 min-w-[50px]",
                        isActive && index < currentStage - 1
                          ? "bg-[#16AB60]"
                          : "bg-[#D0D5DD]",
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isActive ? "text-[#101828]" : "text-[#98A2B3]",
                    )}
                  >
                    {label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStatus = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "text-[#98A2B3]",
      "In Transit": "text-[#F5A623]",
      Delivered: "text-[#5F35D2]",
    };
    return (
      <span className={cn("text-sm font-bold", colors[status])}>{status}</span>
    );
  };

  const renderCertification = (cert: string) => {
    const colors: Record<string, string> = {
      Pending: "text-[#98A2B3]",
      Unverified: "text-[#5F35D2] font-bold",
      Verified: "text-[#16AB60] font-bold",
    };
    return <span className={cn("text-sm", colors[cert])}>{cert}</span>;
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-[#F9F9FB] -m-6 p-6">
      {/* Page Header Tabs */}
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-4">
        <div className="flex gap-4">
          {["Stock Transfer", "Incoming", "Activity Log"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setStep("list");
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 rounded-full",
                activeTab === tab
                  ? "bg-[#EAE3FF] text-[#5F35D2]"
                  : "text-[#667085] hover:text-[#5F35D2]",
              )}
            >
              {tab === "Stock Transfer" && (
                <StockTransferIcon className="w-4 h-4" />
              )}
              {tab === "Incoming" && (
                <IncomingIcon active={activeTab === tab} />
              )}
              {tab === "Activity Log" && (
                <ActivityLogIcon active={activeTab === tab} />
              )}
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#475467]">
          <MarylandIcon />
          Current Store:{" "}
          <span className="font-semibold text-[#101828]">
            {currentBusinessName}
          </span>
        </div>
      </div>

      {step === "list" && !selectedIncoming && (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[28px] font-bold text-[#101828]">
                {activeTab === "Stock Transfer" && "Stock Transfers"}
                {activeTab === "Incoming" && "Incoming Transfers"}
                {activeTab === "Activity Log" && "Activity Log"}
              </h1>
              <p className="text-[#667085]">
                {activeTab === "Stock Transfer" &&
                  "Manage inventory movement between business"}
                {activeTab === "Incoming" &&
                  "Confirm stock transferred to your business here."}
                {activeTab === "Activity Log" &&
                  "View stock transfer activity in your business."}
              </p>
            </div>
            {activeTab === "Stock Transfer" && (
              <Button
                onClick={handleCreateNew}
                className="bg-[#5F35D2] text-white rounded-xl px-6 py-4 font-semibold gap-3 h-auto shadow-none"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Create Stock Transfer
              </Button>
            )}
          </div>

          <div className="flex gap-4">
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
            <Select
              placeholder="Status"
              className="w-40"
              variant="bordered"
              classNames={{
                trigger:
                  "h-[48px] bg-white rounded-lg border-[#E4E7EC] shadow-none data-[hover=true]:border-[#101828] data-[open=true]:border-[#101828] focus:border-[#101828]",
              }}
              renderValue={(items) => (
                <span className="text-[#475467] text-sm">
                  {items[0]?.textValue || "Status"}
                </span>
              )}
              selectorIcon={<ChevronDown className="w-4 h-4 text-[#98A2B3]" />}
            >
              <SelectItem className="text-[#344054]" key="draft" value="draft">
                Draft
              </SelectItem>
              <SelectItem
                className="text-[#344054]"
                key="transit"
                value="transit"
              >
                In Transit
              </SelectItem>
              <SelectItem
                className="text-[#344054]"
                key="delivered"
                value="delivered"
              >
                Delivered
              </SelectItem>
            </Select>
            <Select
              placeholder="Business"
              className="w-44"
              variant="bordered"
              isLoading={businessesLoading}
              selectedKeys={selectedBusiness ? [selectedBusiness] : []}
              onSelectionChange={(keys) =>
                setSelectedBusiness(Array.from(keys)[0] as string)
              }
              classNames={{
                trigger:
                  "h-[48px] bg-white rounded-lg border-[#E4E7EC] shadow-none data-[hover=true]:border-[#101828] data-[open=true]:border-[#101828] focus:border-[#101828]",
              }}
              renderValue={(items) => (
                <span className="text-[#475467] text-sm">
                  {items[0]?.textValue || "Business"}
                </span>
              )}
              selectorIcon={<ChevronDown className="w-4 h-4 text-[#98A2B3]" />}
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
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#F2F4F7]">
              <h2 className="text-xl font-bold text-[#344054]">
                {activeTab === "Stock Transfer" && "Stock Transfer History"}
                {activeTab === "Incoming" && "Incoming List"}
                {activeTab === "Activity Log" && "Activity List"}
              </h2>
            </div>

            {activeTab === "Stock Transfer" && (
              <Table
                aria-label="Stock Transfer History"
                removeWrapper
                isCompact
                classNames={{
                  th: "text-default-500 text-xs border-b border-divider py-4 rounded-none bg-grey300",
                  tr: "border-b border-divider rounded-none",
                  td: "py-3 text-textGrey group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none group-data-[middle=true]:before:rounded-none group-data-[last=true]:first:before:rounded-none group-data-[last=true]:last:before:rounded-none",
                }}
              >
                <TableHeader>
                  <TableColumn>Issue Date</TableColumn>
                  <TableColumn>Transfer ID</TableColumn>
                  <TableColumn>Transfer Route</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Initiating Staff</TableColumn>
                  <TableColumn>No. of Items</TableColumn>
                  <TableColumn>Certification</TableColumn>
                  <TableColumn align="center"> </TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.issueDate}</TableCell>
                      <TableCell className="font-bold text-[#101828]">
                        {item.transferId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-[#101828] font-medium">
                            {item.route.split("→")[0].trim()}
                          </span>
                          <ArrowRight
                            className="w-3 h-3 text-[#98A2B3]"
                            strokeWidth={3}
                          />
                          <span className="text-[#101828] font-medium">
                            {item.route.split("→")[1].trim()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStatus(item.status)}</TableCell>
                      <TableCell>{item.staff}</TableCell>
                      <TableCell className="font-bold">
                        {item.itemCount}
                      </TableCell>
                      <TableCell>
                        {renderCertification(item.certification)}
                      </TableCell>
                      <TableCell>
                        <div
                          className="relative flex justify-center items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Dropdown>
                            <DropdownTrigger aria-label="actions">
                              <div className="cursor-pointer flex justify-center items-center text-black">
                                <HiOutlineDotsVertical className="text-[22px]" />
                              </div>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Transfer actions" className="text-black">
                              <DropdownSection>
                                <DropdownItem
                                  key="view"
                                  startContent={<Eye size={16} />}
                                >
                                  View Details
                                </DropdownItem>
                                <DropdownItem
                                  key="edit"
                                  startContent={<Pencil size={16} />}
                                >
                                  Edit
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  startContent={<Trash2 size={16} />}
                                  className="text-danger"
                                  color="danger"
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownSection>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "Incoming" && (
              <Table
                aria-label="Incoming Transfers List"
                removeWrapper
                isCompact
                classNames={{
                  th: "text-default-500 text-xs border-b border-divider py-4 rounded-none bg-grey300",
                  tr: "border-b border-divider rounded-none",
                  td: "py-3 text-textGrey group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none group-data-[middle=true]:before:rounded-none group-data-[last=true]:first:before:rounded-none group-data-[last=true]:last:before:rounded-none",
                }}
              >
                <TableHeader>
                  <TableColumn>Issue Date</TableColumn>
                  <TableColumn>Transfer ID</TableColumn>
                  <TableColumn>Received From</TableColumn>
                  <TableColumn>No. of Items</TableColumn>
                  <TableColumn align="center">Status</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredIncoming.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.issueDate}</TableCell>
                      <TableCell className="font-bold">
                        {transfer.transferId}
                      </TableCell>
                      <TableCell className="font-semibold text-[#101828]">
                        {transfer.receivedFrom}
                      </TableCell>
                      <TableCell className="font-bold">
                        {transfer.itemCount}
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
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "Activity Log" && (
              <div className="flex flex-col gap-6 p-8">
                {activityItems.map((activity) => (
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
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {step === "select" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pt-4">
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
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E4E7EC] shadow-sm flex flex-col gap-6">
              <div className="relative">
                <Autocomplete
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
                  onSelectionChange={(key) => {
                    if (key) {
                      const item = (sourceItems || []).find(
                        (i: any) => i.id === key,
                      );
                      if (item) {
                        handleSelectItem({
                          id: item.id,
                          name: item.name,
                          unit: item.unitName || "Unit",
                          currentStock: item.stockLevel,
                          transferQty: 0,
                        });
                      }
                    }
                  }}
                  selectorIcon={<Search className="w-5 h-5 text-[#98A2B3]" />}
                >
                  {(sourceItems || [])
                    .filter(
                      (item: any) =>
                        !selectedItems.find((i) => i.id === item.id),
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
                    Search and select items to transfer (press Enter)
                  </div>
                )}
              </div>

              <Button
                isDisabled={!selectedBusiness || selectedItems.length === 0}
                onClick={() => {
                  console.log(
                    "Stock Transfer (Step 1) - Current Business ID:",
                    currentBusinessId,
                  );
                  console.log(
                    "Stock Transfer (Step 1) - Destination Business ID (Selected):",
                    selectedBusiness,
                  );
                  handleProceedToInitiate();
                }}
                className={cn(
                  "w-full rounded-xl py-5 font-bold text-base gap-3 transition-all",
                  selectedBusiness && selectedItems.length > 0
                    ? "bg-[#5F35D2] text-white shadow-none"
                    : "bg-[#D0D5DD] text-[#98A2B3]",
                )}
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Create stock Transfer
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "initiate" && (
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#344054]" />
              </button>
              <h1 className="text-[20px] font-bold text-[#101828]">
                {transferStage === 1
                  ? "Initiate or save transfer"
                  : "Stock Transfer"}
              </h1>
            </div>
            {transferStage < 5 && (
              <div className="text-sm font-semibold text-[#98A2B3]">2 of 2</div>
            )}
            {transferStage === 5 && (
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

          <div className="flex items-center gap-3 mt-1.5 font-medium text-[#667085]">
            <span className="text-[#101828] font-bold">
              {currentBusinessName}
            </span>
            <ArrowRight className="w-3 h-3" strokeWidth={3} />
            <span className="text-[#101828] font-bold">
              {businesses.find((b) => b.value === selectedBusiness)?.label}
            </span>
          </div>

          {transferStage > 1 && (
            <ProgressIndicator currentStage={transferStage} />
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden w-full relative">
              {transferStage === 1 ? (
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
                            onInputChange={(value) => setDestSearchQuery(value)}
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
                            {(destinationItems || []).map((destItem: any) => (
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
              ) : (
                <Table
                  aria-label="View Transfer List"
                  removeWrapper
                  classNames={{
                    th: "bg-[#F9FAFB] text-[#667085] font-bold text-[10px] py-5 px-6 uppercase tracking-wider",
                    td: "py-5 px-6 text-sm text-[#344054] border-b border-[#F2F4F7] font-bold relative",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Source Name (Source)</TableColumn>
                    <TableColumn align="center"> </TableColumn>
                    <TableColumn>Item Name (Destination)</TableColumn>
                    <TableColumn>Item Unit</TableColumn>
                    <TableColumn>Transfer QTy</TableColumn>
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
              )}
              {/* Scrollbar UI as seen in the design */}
              <div className="absolute right-0 top-[60px] bottom-0 w-[6px] bg-[#F2F4F7] rounded-full mx-1">
                <div className="w-full h-20 bg-[#D0D5DD] rounded-full" />
              </div>
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-10 rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col gap-10">
                <h3 className="text-[24px] font-bold text-[#475467] text-center">
                  Summary
                </h3>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Created At:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {currentBusinessName}
                    </span>
                  </div>
                  {transferStage > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Created By:
                      </span>
                      <span className="font-bold text-[#475467]">
                        {getJsonItemFromLocalStorage("business")?.[0]
                          ?.staffName || "Staff"}
                      </span>
                    </div>
                  )}
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
                  {transferStage > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Status:
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          transferStage === 2 && "text-[#F5A623]",
                          transferStage === 3 && "text-[#5F35D2]",
                          transferStage >= 4 && "text-[#667085]",
                        )}
                      >
                        {transferStage === 2
                          ? "In-Transit"
                          : transferStage === 3
                            ? "Delivered"
                            : "Completed"}
                      </span>
                    </div>
                  )}
                  {transferStage > 1 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#667085] font-medium">
                        Verification:
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          transferStage === 2 && "text-[#98A2B3]",
                          transferStage === 3 && "text-[#5F35D2]",
                          transferStage >= 4 && "text-[#16AB60]",
                        )}
                      >
                        {transferStage === 2
                          ? "Pending"
                          : transferStage === 3
                            ? "Unverified"
                            : "Verified"}
                      </span>
                    </div>
                  )}
                  <div className="h-[1px] bg-[#F2F4F7] w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Number of Items:
                    </span>
                    <span className="font-bold text-[#101828] text-base">
                      {selectedItems.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {transferStage < 5 && (
                    <Button
                      onClick={() => {
                        if (transferStage === 1) {
                          handleInitiateTransfer(false);
                        } else if (transferStage === 4) {
                          handleInitiateTransfer(true);
                        } else {
                          setTransferStage(transferStage + 1);
                        }
                      }}
                      isLoading={isLoading}
                      isDisabled={isLoading}
                      className="w-full bg-[#5F35D2] text-white rounded-lg py-4 font-bold text-sm gap-3 shadow-none"
                      endContent={
                        transferStage < 4 && !isLoading ? (
                          <ArrowRight className="w-4 h-4" />
                        ) : null
                      }
                    >
                      {transferStage === 1 && "Initiate Stock Transfer"}
                      {transferStage === 2 && "Mark as In-transit"}
                      {transferStage === 3 && "Mark as Delivered"}
                      {transferStage === 4 && (
                        <div className="flex items-center gap-2">
                          Mark as Verified
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.75 12.75L10 15L16.25 8.75"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </Button>
                  )}
                  {transferStage === 1 && (
                    <Button
                      onClick={handleSaveDraft}
                      className="w-full bg-[#D0D5DD] text-white rounded-lg py-4 font-bold text-sm gap-3 shadow-none"
                      endContent={<ArrowRight className="w-4 h-4" />}
                    >
                      Save as draft
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedIncoming && (
        <div className="flex flex-col gap-6 pt-4">
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

          <ProgressIndicator
            currentStage={selectedIncoming.status === "Verified" ? 4 : 3}
          />

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden w-full relative">
              {incomingDetailsLoading ? (
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
              )}
              {/* Scrollbar UI as seen in the design */}
              <div className="absolute right-0 top-[60px] bottom-0 w-[6px] bg-[#F2F4F7] rounded-full mx-1">
                <div className="w-full h-20 bg-[#D0D5DD] rounded-full" />
              </div>
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-10 rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col gap-10">
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
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Verification:
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        selectedIncoming.status === "Confirm"
                          ? "text-[#101828]"
                          : "text-[#16AB60]",
                      )}
                    >
                      {selectedIncoming.status === "Confirm"
                        ? "Unverified"
                        : "Verified"}
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
    </div>
  );
}
