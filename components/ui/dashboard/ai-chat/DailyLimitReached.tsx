"use client";

import { useRouter } from "next/navigation";
import moment from "moment";
import { Clock, Hourglass, ChevronsUp } from "lucide-react";

const UPGRADE_ROUTE = "/dashboard/settings/subscriptions";

interface DailyLimitReachedProps {
  used: number;
  limit: number;
  resetsAt: string | null;
  /** Re-checks the quota (e.g. after the reset time has passed). */
  onWait: () => void;
}

const DailyLimitReached = ({
  used,
  limit,
  resetsAt,
  onWait,
}: DailyLimitReachedProps) => {
  const router = useRouter();
  const reset = resetsAt ? moment(resetsAt) : null;
  const resetTime = reset?.isValid() ? reset.format("h:mma") : "midnight";
  const hoursRemaining =
    reset?.isValid() ? Math.max(0, reset.diff(moment(), "hours")) : null;

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
        <Hourglass className="h-7 w-7" />
      </span>

      <h3 className="mt-5 text-xl font-bold text-dark">Daily limit reached</h3>
      <p className="mt-2 max-w-sm text-sm text-grey500">
        You&apos;ve used all {limit} prompts for today. Your quota resets at
        midnight. Upgrade to Premium for unlimited access.
      </p>

      <div className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50/50 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-red-500">
            <Clock className="h-4 w-4" />
            Today&apos;s prompts
          </span>
          <span className="text-sm font-bold text-red-500">
            {used} of {limit} Used
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-red-100">
          <div className="h-full w-full rounded-full bg-red-500" />
        </div>
        <p className="mt-3 text-xs text-grey500">
          Reset at {resetTime}.{" "}
          {hoursRemaining !== null && (
            <span className="font-semibold text-red-500">
              ~ {hoursRemaining}hours remaining
            </span>
          )}
        </p>
      </div>

      <div className="mt-6 flex w-full items-center justify-center gap-3">
        <button
          type="button"
          onClick={onWait}
          className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-grey300 px-4 py-2.5 text-sm font-medium text-textGrey transition-colors hover:bg-black/5"
        >
          <Clock className="h-4 w-4" />
          Wait for Reset
        </button>
        <button
          type="button"
          onClick={() => router.push(UPGRADE_ROUTE)}
          className="flex items-center gap-2 rounded-xl bg-primaryColor px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <ChevronsUp className="h-4 w-4" />
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};

export default DailyLimitReached;
