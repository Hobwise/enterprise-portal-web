"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  X,
  SquarePen,
  History,
} from "lucide-react";

import { cn } from "@/lib/utils";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";
import PromptQuotaBar from "./PromptQuotaBar";
import SparkleIcon from "./SparkleIcon";
import WelcomeScreen from "./WelcomeScreen";
import ChatHistoryView from "./ChatHistoryView";
import DailyLimitReached from "./DailyLimitReached";
import { UseAiChat } from "./useAiChat";

type PanelView = "main" | "history";

// Container fades (this is the exit animation AnimatePresence awaits); the
// dialog scales/slides on top of it.
const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PANEL_VARIANTS: Variants = {
  hidden: { scale: 0.92, y: 40, opacity: 0 },
  visible: { scale: 1, y: 0, opacity: 1 },
};

const PANEL_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

interface AiChatPanelProps {
  chat: UseAiChat;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

const AiChatPanel = ({
  chat,
  expanded,
  onToggleExpand,
  onClose,
}: AiChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<PanelView>("main");

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages, chat.isThinking]);

  const handleNewChat = () => {
    chat.startNewChat();
    setView("main");
  };

  const handleSelectSession = (sessionId: string) => {
    chat.loadSession(sessionId);
    setView("main");
  };

  const handleViewHistory = () => {
    chat.refreshHistory();
    setView("history");
  };

  // Close on Escape for keyboard accessibility.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50"
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* Dim the dashboard only in the expanded (modal-like) view. */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            className="pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggleExpand}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        role="dialog"
        aria-label="Hospira chat"
        variants={PANEL_VARIANTS}
        transition={PANEL_TRANSITION}
        style={{ transformOrigin: "bottom right" }}
        className={cn(
          "pointer-events-auto absolute flex flex-col overflow-hidden bg-aiChatSurface shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
          "inset-0 sm:inset-auto sm:rounded-3xl sm:border sm:border-black/[0.06]",
          expanded
            ? "sm:inset-0 sm:m-auto sm:h-[88vh] sm:max-h-[900px] sm:w-[860px] sm:max-w-[94vw]"
            : "sm:bottom-6 sm:right-6 sm:h-[640px] sm:max-h-[calc(100vh-3rem)] sm:w-[420px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primaryColor to-secondaryColor text-white shadow-sm">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-dark">Hospira</h2>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={chat.isResponding}
              aria-label="Start a new chat"
              title="New chat"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-grey400 transition-colors hover:bg-grey300 hover:text-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SquarePen className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleViewHistory}
              aria-label="View chat history"
              title="Chat history"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-grey400 transition-colors hover:bg-grey300 hover:text-dark"
            >
              <History className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={expanded ? "Collapse chat" : "Expand chat"}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-grey400 transition-colors hover:bg-grey300 hover:text-dark"
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-grey400 transition-colors hover:bg-grey300 hover:text-dark"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          className={cn(
            "scrollbar-hide flex-1 overflow-y-auto py-5",
            expanded ? "px-6 sm:px-10" : "px-4"
          )}
        >
          <div
            className={cn(
              "mx-auto h-full w-full",
              expanded && view !== "history" && "max-w-3xl"
            )}
          >
            {view === "history" ? (
              <ChatHistoryView
                history={chat.history}
                loading={chat.historyLoading}
                onBack={() => setView("main")}
                onStartNew={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={chat.deleteSession}
              />
            ) : chat.quotaReached && chat.messages.length === 0 ? (
              <DailyLimitReached
                used={chat.promptsUsed}
                limit={chat.promptLimit}
                resetsAt={chat.resetsAt}
                onWait={chat.refreshQuota}
              />
            ) : chat.messages.length === 0 ? (
              <WelcomeScreen
                userName={chat.userName}
                onSuggestion={chat.sendMessage}
              />
            ) : (
              <div className="space-y-5">
                {chat.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {chat.isThinking && <ThinkingIndicator />}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        {view !== "history" && (
          <div
            className={cn(
              "space-y-3 border-t border-black/[0.06] pb-3 pt-4",
              expanded ? "px-6 sm:px-10" : "px-4"
            )}
          >
            <div
              className={cn(
                "mx-auto w-full space-y-3",
                expanded && "max-w-3xl"
              )}
            >
              <PromptQuotaBar
                used={chat.promptsUsed}
                limit={chat.promptLimit}
                unlimited={chat.unlimited}
              />
              <ChatInput
                onSend={chat.sendMessage}
                disabled={chat.isResponding || chat.quotaReached}
                quotaReached={chat.quotaReached}
                onVoiceSupportChange={() => {}}
              />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AiChatPanel;
