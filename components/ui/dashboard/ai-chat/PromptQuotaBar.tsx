"use client";

import { Clock } from "lucide-react";

interface PromptQuotaBarProps {
  used: number;
  limit: number;
  /** Premium/unlimited plans hide the numeric cap. */
  unlimited?: boolean;
}

const PromptQuotaBar = ({ used, limit, unlimited }: PromptQuotaBarProps) => {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="flex items-center gap-2 text-sm font-medium text-textGrey">
        <Clock className="h-4 w-4 text-textGrey" />
        Today&apos;s prompts
      </span>
      <span className="text-sm font-bold text-primaryColor">
        {unlimited ? `${used} Used · Unlimited` : `${used} of ${limit} Used`}
      </span>
    </div>
  );
};

export default PromptQuotaBar;
