"use client";

import { CheckCircle2 } from "lucide-react";

/**
 * Confirmation shown once an escalation email has been sent. Reused by
 * `EscalationCard` (local sent state) and `ChatMessage` (history messages that
 * carry the `[ESCALATION EMAIL SENT]` tag / `escalationSent` flag).
 */
const EscalationSentNotice = () => (
  <div className="w-full max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-green-800">Message sent!</p>
        <p className="mt-0.5 text-xs text-green-700">
          Our support team will follow up shortly.
        </p>
      </div>
    </div>
  </div>
);

export default EscalationSentNotice;
