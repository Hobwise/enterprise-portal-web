"use client";

import { useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentHistoryItem } from "./agentChatApi";
import { groupHistoryByDay, relativeDayLabel } from "./chatHistoryUtils";

interface ChatHistoryListProps {
  history: AgentHistoryItem[];
  onSelect: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void | Promise<void>;
  /** Cap the number of rows (used for the welcome-screen preview). */
  limit?: number;
  loading?: boolean;
  emptyLabel?: string;
}

const ChatHistoryList = ({
  history,
  onSelect,
  onDelete,
  limit,
  loading,
  emptyLabel = "No conversations yet",
}: ChatHistoryListProps) => {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading && history.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-grey500">Loading…</p>
    );
  }

  if (history.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-grey500">{emptyLabel}</p>
    );
  }

  const handleConfirmDelete = async (sessionId: string) => {
    if (!onDelete) return;
    setDeletingId(sessionId);
    try {
      await onDelete(sessionId);
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  const groups = groupHistoryByDay(history, limit);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="px-1 text-xs font-medium text-grey500">{group.label}</p>
          <div className="space-y-2">
            {group.items.map((item) => {
              const isConfirming = confirmingId === item.sessionId;
              const isDeleting = deletingId === item.sessionId;
              return (
                <div
                  key={item.sessionId}
                  className="group relative flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.sessionId)}
                    className="w-full rounded-2xl border border-secondaryGrey/70 bg-aiChatInput px-4 py-3 text-left transition-colors hover:border-primaryColor/40 hover:bg-primaryColor/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="line-clamp-1 text-sm font-semibold text-dark">
                        {item.title || "Untitled chat"}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[11px] text-grey500 transition-opacity",
                          onDelete && "group-hover:opacity-0",
                          isConfirming && "opacity-0"
                        )}
                      >
                        {relativeDayLabel(item.lastActive)}
                      </span>
                    </div>
                    <span className="mt-1 block text-xs text-grey500">
                      {item.messageCount} message
                      {item.messageCount === 1 ? "" : "s"}
                    </span>
                  </button>

                  {onDelete && isConfirming ? (
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(item.sessionId)}
                        disabled={isDeleting}
                        aria-label="Confirm delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-500 text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-70"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isDeleting}
                        aria-label="Cancel delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondaryGrey/70 bg-white text-grey500 shadow-sm transition-colors hover:text-dark disabled:opacity-70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    onDelete && (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(item.sessionId)}
                        aria-label="Delete conversation"
                        className={cn(
                          "absolute right-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-secondaryGrey/70 bg-white shadow-sm",
                          "text-grey500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 group-hover:flex"
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistoryList;
