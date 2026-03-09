"use client";

import React, { useState, useMemo } from "react";
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
} from "@nextui-org/react";
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronDown,
} from "lucide-react";
import { StockTransferIcon } from "@/public/assets/svg";
import { cn } from "@/lib/utils";

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
  destinationName?: string;
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

const mockIncoming: IncomingTransfer[] = [
  {
    id: "1",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    receivedFrom: "Ikeja Business",
    certification: "Unverified",
    itemCount: 7,
    status: "Confirm",
  },
  {
    id: "2",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    receivedFrom: "Lekki 1 Business",
    certification: "Unverified",
    itemCount: 5,
    status: "Confirm",
  },
  {
    id: "3",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    receivedFrom: "Ajah Business",
    certification: "Verified",
    itemCount: 12,
    status: "Verified",
  },
  {
    id: "4",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    receivedFrom: "Victoria Island Business",
    certification: "Verified",
    itemCount: 9,
    status: "Verified",
  },
  {
    id: "5",
    issueDate: "1/02/2026",
    transferId: "454ISTR",
    receivedFrom: "Ikoyi Business",
    certification: "Verified",
    itemCount: 5,
    status: "Verified",
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

const businesses = [
  { label: "Cubana Restaurants and Grills Ikeja", value: "ikeja" },
  { label: "Lekki 1 Business", value: "lekki1" },
  { label: "Ajah Business", value: "ajah" },
  { label: "Victoria Island Business", value: "vi" },
  { label: "Ikoyi Business", value: "ikoyi" },
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
  const [step, setStep] = useState<Step>("list");
  const [activeTab, setActiveTab] = useState("Stock Transfer");
  const [selectedBusiness, setSelectedBusiness] = useState("ikeja");
  const [selectedItems, setSelectedItems] = useState<TransferItem[]>(
    mockItems.slice(0, 6),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [transferStage, setTransferStage] = useState(1); // 1: Initial, 2: In-Transit, 3: Delivered, 4: Verified, 5: Completed
  const [incomingTransfers, setIncomingTransfers] =
    useState<IncomingTransfer[]>(mockIncoming);
  const [selectedIncoming, setSelectedIncoming] =
    useState<IncomingTransfer | null>(null);

  const filteredTransfers = useMemo(() => {
    return mockTransfers.filter(
      (t) =>
        t.transferId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.route.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

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

  const handleSelectItem = (item: TransferItem) => {
    if (!selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const handleProceedToInitiate = () => {
    if (selectedBusiness && selectedItems.length > 0) {
      setStep("initiate");
    }
  };

  const handleConfirmIncoming = (transferId: string) => {
    setIncomingTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: "Verified", certification: "Verified" }
          : t,
      ),
    );
    setSelectedIncoming(null);
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
    const dates = [
      "Mar 2, 2026 07 : 48am",
      "Mar 2, 2026 07 : 48am",
      "Mar 2, 2026 09 : 15am",
      "Mar 2, 2026 09 : 25am",
    ];

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
                  {isActive && (
                    <span className="text-[10px] text-[#667085] whitespace-nowrap">
                      {dates[index]}
                    </span>
                  )}
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
          <span className="font-semibold text-[#101828]">Maryland</span>
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
              <SelectItem className="text-[#344054]" key="transit" value="transit">
                In Transit
              </SelectItem>
              <SelectItem className="text-[#344054]" key="delivered" value="delivered">
                Delivered
              </SelectItem>
            </Select>
            <Select
              placeholder="Business"
              className="w-44"
              variant="bordered"
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
                <SelectItem className="text-[#344054]" key={b.value} value={b.value}>
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
                classNames={{
                  th: "bg-[#F9FAFB] text-[#667085] font-bold text-[10px] py-4 px-6 uppercase tracking-wider",
                  td: "py-4 px-6 text-sm text-[#344054] border-b border-[#F2F4F7]",
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
                        <button className="p-2 hover:bg-[#F9FAFB] rounded-full text-[#667085] transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
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
                classNames={{
                  th: "bg-[#F9FAFB] text-[#667085] font-bold text-[10px] py-4 px-6 uppercase tracking-wider",
                  td: "py-4 px-6 text-sm text-[#344054] border-b border-[#F2F4F7]",
                }}
              >
                <TableHeader>
                  <TableColumn>Issue Date</TableColumn>
                  <TableColumn>Transfer ID</TableColumn>
                  <TableColumn>Received From</TableColumn>
                  <TableColumn>Cerification</TableColumn>
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
                      <TableCell>
                        <span
                          className={cn(
                            "font-bold text-sm",
                            transfer.certification === "Unverified"
                              ? "text-[#F5A623]"
                              : "text-[#16AB60]",
                          )}
                        >
                          {transfer.certification}
                        </span>
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
                {mockActivities.map((activity) => (
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
                  <SelectItem className="text-[#344054]" key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E4E7EC] shadow-sm flex flex-col gap-6">
              <div className="relative">
                <Input
                  placeholder="Search and add Items"
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "bg-[#F2F4F7] border-none h-[56px] rounded-lg px-6 shadow-none",
                    input:
                      "text-[#101828] font-medium placeholder:text-[#98A2B3] text-sm",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const input = (
                        e.target as HTMLInputElement
                      ).value.toLowerCase();
                      const item = mockItems.find((i) =>
                        i.name.toLowerCase().includes(input),
                      );
                      if (item) handleSelectItem(item);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  endContent={
                    <Search className="w-5 h-5 text-[#98A2B3] cursor-pointer" />
                  }
                />
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
                onClick={handleProceedToInitiate}
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
                {transferStage === 1 ? "Initiate or save transfer" : "4541STR"}
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

          <div>
            <h2 className="text-[24px] font-bold text-[#1D2939] tracking-tight">
              {transferStage === 1 ? "4541STR" : ""}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 font-medium text-[#667085]">
              <span className="text-[#101828]">Maryland Business</span>
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
              <span className="text-[#101828]">
                {businesses.find((b) => b.value === selectedBusiness)?.label}
              </span>
            </div>
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
                          {item.destinationName ? (
                            <span className="text-[#101828]">
                              {item.destinationName}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 text-[#98A2B3] bg-[#F2F4F7] px-3 py-2.5 rounded-lg border border-dashed border-[#D0D5DD] font-medium w-full min-w-[140px]">
                              Search Item name <Search className="w-4 h-4" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue="35"
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
                            35
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
                      Maryland Business
                    </span>
                  </div>
                  {transferStage > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-medium">
                        Created By:
                      </span>
                      <span className="font-bold text-[#475467]">
                        Adams (Admin)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Destination:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {
                        businesses
                          .find((b) => b.value === selectedBusiness)
                          ?.label.split(" Business")[0]
                      }{" "}
                      Business
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
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Items Value:
                    </span>
                    <span className="font-bold text-[#101828] text-base">
                      N450,000.00
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {transferStage < 5 && (
                    <Button
                      onClick={() => setTransferStage(transferStage + 1)}
                      className="w-full bg-[#5F35D2] text-white rounded-lg py-4 font-bold text-sm gap-3 shadow-none"
                      endContent={
                        transferStage < 4 ? (
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
                  {selectedIncoming.transferId}
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
                Maryland Business
              </span>
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
              <span className="text-[#101828] font-bold">
                {selectedIncoming.receivedFrom}
              </span>
            </div>
          </div>

          <ProgressIndicator
            currentStage={selectedIncoming.status === "Verified" ? 4 : 3}
          />

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden w-full relative">
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
                          {item.destinationName || "New Item name"}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <span className="text-[#101828] ml-8 font-bold">
                          {item.id === "1" ? "35" : "10"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      Maryland Business
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Created By:
                    </span>
                    <span className="font-bold text-[#475467]">
                      Adams (Admin)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Destination:
                    </span>
                    <span className="font-bold text-[#475467]">
                      {selectedIncoming.receivedFrom}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">Status:</span>
                    <span className="font-bold text-[#101828]">Completed</span>
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
                      {selectedIncoming.itemCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] font-medium">
                      Items Value:
                    </span>
                    <span className="font-bold text-[#101828] text-base">
                      N450,000.00
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {selectedIncoming.status === "Confirm" && (
                    <Button
                      onClick={() => handleConfirmIncoming(selectedIncoming.id)}
                      className="w-full bg-[#5F35D2] text-white rounded-lg py-4 font-bold text-sm gap-3 shadow-none"
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
