"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import { HiOutlineQrcode } from "react-icons/hi";
import { LuSettings } from "react-icons/lu";
import {
  MdOutlineAddBox,
  MdOutlineCampaign,
  MdOutlineEventNote,
  MdOutlinePayments,
  MdOutlineReceiptLong,
  MdOutlineTune,
} from "react-icons/md";
import { PiBookOpenTextLight } from "react-icons/pi";

import DashboardCard from "./DashboardCard";

interface Action {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

const ACTIONS: Action[] = [
  {
    id: "new-order",
    label: "New Order",
    href: "/dashboard/orders/place-order",
    icon: <MdOutlineReceiptLong className="text-[18px]" />,
  },
  {
    id: "view-payments",
    label: "View Payments",
    href: "/dashboard/payments",
    icon: <MdOutlinePayments className="text-[18px]" />,
  },
  {
    id: "new-booking",
    label: "New Booking",
    href: "/dashboard/bookings",
    icon: <MdOutlineEventNote className="text-[18px]" />,
  },
  {
    id: "new-item",
    label: "New Item",
    href: "/dashboard/menu",
    icon: <MdOutlineAddBox className="text-[18px]" />,
  },
  {
    id: "stock-adjust",
    label: "Stock Adjust",
    href: "/dashboard/inventory/stock-adjustment",
    icon: <MdOutlineTune className="text-[18px]" />,
  },
  {
    id: "qr-code",
    label: "QR Code",
    href: "/dashboard/quick-response",
    icon: <HiOutlineQrcode className="text-[18px]" />,
  },
  {
    id: "new-campaign",
    label: "New Campaign",
    href: "/dashboard/campaigns/create-campaign",
    icon: <MdOutlineCampaign className="text-[18px]" />,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings/personal-information",
    icon: <LuSettings className="text-[18px]" />,
  },
];

const QuickActionsCard = () => (
  <DashboardCard className="p-5 flex flex-col gap-4 h-full">
    <div className="flex items-center justify-between">
      <h3 className="text-[15px] font-semibold text-[#0F172A]">
        Quick Actions
      </h3>
      <span className="text-[11px] text-[#64748B]">Shortcuts</span>
    </div>

    <div className="grid grid-cols-2 gap-2.5">
      {ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-[#5F35D2]">{action.icon}</span>
            <span>{action.label}</span>
          </span>
          <FiArrowRight className="text-[14px] text-[#94A3B8]" />
        </Link>
      ))}
    </div>
  </DashboardCard>
);

export default QuickActionsCard;
