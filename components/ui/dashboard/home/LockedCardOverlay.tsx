"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { FiLock } from "react-icons/fi";
import { HiArrowUpRight } from "react-icons/hi2";

interface LockedCardOverlayProps {
  children: ReactNode;
  variant?: "card" | "tile";
  planLabel?: string;
  upgradeHref?: string;
}

const LockedCardOverlay = ({
  children,
  variant = "card",
  planLabel = "Premium Plan",
  upgradeHref = "/dashboard/settings/subscriptions",
}: LockedCardOverlayProps) => {
  const isTile = variant === "tile";

  return (
    <div className="relative isolate h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-50"
      >
        {children}
      </div>

      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/55 backdrop-blur-[2px] ${
          isTile ? "px-3 py-2" : "px-4 py-5"
        }`}
      >
        <span
          className={`inline-flex items-center justify-center rounded-full bg-[#E5E7EB] text-[#64748B] ${
            isTile ? "w-7 h-7" : "w-10 h-10"
          }`}
        >
          <FiLock className={isTile ? "text-[14px]" : "text-[18px]"} />
        </span>

        <p
          className={`text-center text-[#0F172A] ${
            isTile ? "text-[11px]" : "text-[13px]"
          }`}
        >
          Available on{" "}
          <span className="font-semibold text-[#5F35D2]">{planLabel}</span>
        </p>

        <Link
          href={upgradeHref}
          className={`inline-flex items-center gap-1 bg-[#5F35D2] text-white rounded-md font-medium hover:bg-[#4C1D95] transition-colors ${
            isTile
              ? "text-[11px] px-2.5 py-1"
              : "text-[12px] px-3 py-1.5"
          }`}
        >
          Upgrade Plan
          <HiArrowUpRight className={isTile ? "text-[11px]" : "text-[12px]"} />
        </Link>
      </div>
    </div>
  );
};

export default LockedCardOverlay;
