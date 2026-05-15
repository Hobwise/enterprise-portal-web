"use client";

import { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

const baseClass =
  "bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

const DashboardCard = ({
  children,
  className = "",
  as: Tag = "div",
}: DashboardCardProps) => {
  return <Tag className={`${baseClass} ${className}`}>{children}</Tag>;
};

export default DashboardCard;
