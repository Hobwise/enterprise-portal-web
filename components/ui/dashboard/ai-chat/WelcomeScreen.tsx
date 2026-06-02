"use client";

import {
  Boxes,
  CalendarPlus,
  MessagesSquare,
  QrCode,
  LucideIcon,
} from "lucide-react";
import { AgentHistoryItem } from "./agentChatApi";
import ChatHistoryList from "./ChatHistoryList";

interface Suggestion {
  icon: LucideIcon;
  label: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: MessagesSquare,
    label: "What was the average sales ye…?",
    prompt: "What was the average sales yesterday?",
  },
  {
    icon: CalendarPlus,
    label: "How do i create a reservation?",
    prompt: "How do I create a reservation?",
  },
  {
    icon: Boxes,
    label: "How do i transfer stock to new…?",
    prompt: "How do I transfer stock to a new location?",
  },
  {
    icon: QrCode,
    label: "Where do i view QR reports?",
    prompt: "Where do I view QR reports?",
  },
];

interface WelcomeScreenProps {
  userName: string;
  history: AgentHistoryItem[];
  historyLoading: boolean;
  onSuggestion: (prompt: string) => void;
  onSelectSession: (sessionId: string) => void;
  onViewHistory: () => void;
}

const WelcomeScreen = ({
  userName,
  history,
  historyLoading,
  onSuggestion,
  onSelectSession,
  onViewHistory,
}: WelcomeScreenProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4 text-center">
        <h3 className="text-2xl font-bold text-dark">Good Day, {userName}</h3>
        <p className="mx-auto max-w-sm text-sm text-grey500">
          Ask me anything about your business, HOBWISE platform, or hospitality
          best practices.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-center text-xs font-semibold tracking-wide text-grey500">
          WHAT CAN I HELP YOU WITH?
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => onSuggestion(suggestion.prompt)}
                className="flex items-center gap-3 rounded-2xl border border-secondaryGrey/70 bg-white px-4 py-3 text-left transition-colors hover:border-primaryColor/40 hover:bg-primaryColor/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="line-clamp-1 text-sm font-medium text-textGrey">
                  {suggestion.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {(history.length > 0 || historyLoading) && (
        <div className="space-y-3 rounded-2xl border border-secondaryGrey/70 bg-white p-4">
          <h4 className="text-sm font-bold text-dark">Chat History</h4>
          <ChatHistoryList
            history={history}
            loading={historyLoading}
            limit={3}
            onSelect={onSelectSession}
          />
          {history.length > 0 && (
            <button
              type="button"
              onClick={onViewHistory}
              className="w-full pt-1 text-center text-sm font-semibold text-primaryColor hover:underline"
            >
              View chat history
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
