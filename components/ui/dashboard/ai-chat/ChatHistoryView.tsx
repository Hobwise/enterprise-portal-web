"use client";

import { ArrowLeft, SquarePen } from "lucide-react";
import { AgentHistoryItem } from "./agentChatApi";
import ChatHistoryList from "./ChatHistoryList";

interface ChatHistoryViewProps {
  history: AgentHistoryItem[];
  loading: boolean;
  onBack: () => void;
  onStartNew: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void | Promise<void>;
}

const ChatHistoryView = ({
  history,
  loading,
  onBack,
  onStartNew,
  onSelectSession,
  onDeleteSession,
}: ChatHistoryViewProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-1 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-black/[0.07] bg-grey300 px-3 py-2 text-sm font-medium text-textGrey transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onStartNew}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primaryColor/30 bg-primaryColor/5 px-3 py-2 text-sm font-semibold text-primaryColor transition-colors hover:bg-primaryColor/10"
        >
          <SquarePen className="h-4 w-4" />
          Start New Chat
        </button>
      </div>

      <h3 className="px-1 pb-3 text-lg font-bold text-dark">Chat History</h3>

      <div className="scrollbar-hide flex-1 overflow-y-auto pb-2">
        <ChatHistoryList
          history={history}
          loading={loading}
          onSelect={onSelectSession}
          onDelete={onDeleteSession}
        />
      </div>
    </div>
  );
};

export default ChatHistoryView;
