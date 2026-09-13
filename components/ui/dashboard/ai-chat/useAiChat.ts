"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearItemLocalStorage,
  getFromLocalStorage,
  getJsonItemFromLocalStorage,
  notify,
  saveToLocalStorage,
} from "@/lib/utils";
import { ChatMessageData } from "./types";
import { extractAgentTokens } from "./navTokens";
import {
  AgentChatEvent,
  AgentNavigation,
  AgentHistoryItem,
  deleteAgentSession,
  getAgentHistory,
  getAgentQuota,
  getAgentSession,
  streamAgentChat,
} from "./agentChatApi";

/** Fallback prompt cap used until the real quota loads. */
const DEFAULT_PROMPT_LIMIT = 10;

/** localStorage key holding the active conversation so it survives a refresh. */
const ACTIVE_SESSION_KEY = "hospitalAiActiveSession";

const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes}${meridiem}`;
};

const resolveUserName = (): string => {
  const user = getJsonItemFromLocalStorage("userInformation");
  const full = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  return full || user?.fullName || "there";
};

export interface UseAiChat {
  messages: ChatMessageData[];
  /** The active conversation id (null for a brand-new, unsent chat). */
  sessionId: string | null;
  /** Waiting for the first streamed token (drives the typing indicator). */
  isThinking: boolean;
  /** A request is in-flight from send until the stream completes. */
  isResponding: boolean;
  promptsUsed: number;
  promptLimit: number;
  unlimited: boolean;
  quotaReached: boolean;
  /** ISO timestamp the daily quota resets at (for the limit-reached screen). */
  resetsAt: string | null;
  userName: string;
  history: AgentHistoryItem[];
  historyLoading: boolean;
  refreshHistory: () => Promise<void>;
  refreshQuota: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  startNewChat: () => void;
}

/** Maps the backend role (0 = user, 1 = assistant) to a UI role. */
const roleToUi = (role: number): ChatMessageData["role"] =>
  role === 0 ? "user" : "ai";

export const useAiChat = (): UseAiChat => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const [promptLimit, setPromptLimit] = useState(DEFAULT_PROMPT_LIMIT);
  const [unlimited, setUnlimited] = useState(false);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const [history, setHistory] = useState<AgentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [userName] = useState(resolveUserName);
  // Reactive mirror of `sessionIdRef` so the UI can read the active session.
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Current conversation. `null` => new chat: no sessionId is sent, and the
  // backend mints one (returned on the terminal `done` event).
  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const idCounter = useRef(0);

  // Keep the active session in localStorage so a page refresh restores the same
  // conversation instead of opening a brand-new chat.
  const setActiveSession = useCallback((id: string | null) => {
    sessionIdRef.current = id;
    setSessionId(id);
    if (id) saveToLocalStorage(ACTIVE_SESSION_KEY, id);
    else clearItemLocalStorage(ACTIVE_SESSION_KEY);
  }, []);

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${idCounter.current}`;
  }, []);

  const applyUsage = useCallback((event: AgentChatEvent) => {
    if (event.sessionId) setActiveSession(event.sessionId);
    if (event.usage) {
      setPromptsUsed(event.usage.used);
      setUnlimited(event.usage.isUnlimited || event.usage.limit < 0);
      if (event.usage.limit >= 0) setPromptLimit(event.usage.limit);
      if (event.usage.resetsAt) setResetsAt(event.usage.resetsAt);
    }
  }, [setActiveSession]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistory(await getAgentHistory());
    } catch {
      // Non-fatal: history simply stays as-is.
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshQuota = useCallback(async (signal?: AbortSignal) => {
    const quota = await getAgentQuota(signal).catch(() => null);
    if (!quota) return;
    setPromptsUsed(quota.used);
    setUnlimited(quota.limit < 0);
    if (quota.limit >= 0) setPromptLimit(quota.limit);
    if (quota.resetsAt) setResetsAt(quota.resetsAt);
  }, []);

  // Load the real quota + history once on mount.
  useEffect(() => {
    const controller = new AbortController();
    refreshQuota(controller.signal);
    refreshHistory();
    return () => controller.abort();
  }, [refreshQuota, refreshHistory]);

  // Cancel any in-flight stream when the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const quotaReached = !unlimited && promptsUsed >= promptLimit;

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setActiveSession(null);
    setMessages([]);
    setIsThinking(false);
    setIsResponding(false);
  }, [setActiveSession]);

  const loadSession = useCallback(
    async (sessionId: string) => {
      abortRef.current?.abort();
      abortRef.current = null;
      setIsThinking(false);
      setIsResponding(false);
      const session = await getAgentSession(sessionId);
      const ordered = [...session].sort(
        (a, b) =>
          new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
      );
      setActiveSession(sessionId);
      // Persisted messages carry the same inline tags as the live stream
      // (`[ESCALATE]`, `[NAV:...]`, `[ESCALATION EMAIL SENT]`), so run them
      // through the shared processor instead of rendering the raw content.
      // Pre-process every message once so tag handling matches the live stream.
      const processed = ordered.map((message) => ({
        message,
        role: roleToUi(message.role),
        tokens: extractAgentTokens(message.content),
      }));
      // The backend may append `[ESCALATION EMAIL SENT]` to either the user
      // prompt or the assistant reply. Treat it as a session-level signal and
      // surface the sent-notice on the escalating AI message regardless of
      // which side carries the tag.
      const sessionEscalationSent = processed.some((p) => p.tokens.escalationSent);
      let lastUserText = "";
      let sentNoticeApplied = false;
      setMessages(
        processed.map(({ message, role, tokens }) => {
          const { cleanedText, escalate, escalationSent, navButtons } = tokens;
          const base: ChatMessageData = {
            id: message.id,
            role,
            text: cleanedText,
            time: formatTime(new Date(message.dateCreated)),
          };
          if (role === "user") {
            lastUserText = cleanedText;
            return base;
          }
          // Show the notice if this AI message carries the tag directly, or if
          // the session was escalated-and-sent: attach it to the first
          // escalating reply so it replaces that reply's escalation card.
          const showSent =
            escalationSent ||
            (sessionEscalationSent && escalate && !sentNoticeApplied);
          if (showSent) sentNoticeApplied = true;
          return {
            ...base,
            ...(navButtons.length > 0 && { navButtons }),
            ...(escalate && { escalate: true, userPrompt: lastUserText }),
            ...(showSent && { escalationSent: true }),
          };
        })
      );
    },
    [setActiveSession]
  );

  // Restore the previously active conversation after a refresh. Runs once on
  // mount; a stale/invalid stored id is cleared and we fall back to a new chat.
  useEffect(() => {
    const stored = getFromLocalStorage(ACTIVE_SESSION_KEY);
    if (!stored || typeof stored !== "string") return;
    loadSession(stored).catch(() => {
      clearItemLocalStorage(ACTIVE_SESSION_KEY);
      sessionIdRef.current = null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const ok = await deleteAgentSession(sessionId);
        if (!ok) {
          notify({
            title: "Error!",
            text: "Couldn't delete the conversation. Please try again.",
            type: "error",
          });
          return;
        }
        setHistory((prev) =>
          prev.filter((item) => item.sessionId !== sessionId)
        );
        // If the open conversation was deleted, fall back to a new chat.
        if (sessionIdRef.current === sessionId) startNewChat();
        notify({
          title: "Success!",
          text: "Conversation deleted",
          type: "success",
        });
      } catch {
        notify({
          title: "Error!",
          text: "Couldn't delete the conversation. Please try again.",
          type: "error",
        });
      }
    },
    [startNewChat]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isResponding || quotaReached) return;

      const userMessage: ChatMessageData = {
        id: nextId("user"),
        role: "user",
        text: trimmed,
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      setIsResponding(true);

      const aiId = nextId("ai");
      let started = false;
      let doneEvent: AgentChatEvent | null = null;
      const wasNewChat = !sessionIdRef.current;

      const controller = new AbortController();
      abortRef.current = controller;

      const appendDelta = (chunk: string) => {
        if (!started) {
          started = true;
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            {
              id: aiId,
              role: "ai",
              text: chunk,
              time: formatTime(new Date()),
            },
          ]);
          return;
        }
        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiId
              ? { ...message, text: message.text + chunk }
              : message
          )
        );
      };

      try {
        await streamAgentChat({
          message: trimmed,
          sessionId: sessionIdRef.current,
          signal: controller.signal,
          onDelta: appendDelta,
          onEvent: (event) => {
            if (event.done) {
              applyUsage(event);
              doneEvent = event;
            }
          },
        });
        // Apply navigation hint and the text-embedded tags from the stream.
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== aiId) return m;

            const { cleanedText, escalate, escalationSent, navButtons } =
              extractAgentTokens(m.text);
            let updated: ChatMessageData = { ...m, text: cleanedText };

            if (doneEvent?.escalate || escalate) {
              updated = { ...updated, escalate: true, userPrompt: trimmed };
            }
            if (escalationSent) {
              updated = { ...updated, escalationSent: true };
            }
            if (navButtons.length > 0) {
              updated = { ...updated, navButtons };
            }

            const nav = doneEvent?.navigation as AgentNavigation | null;
            if (nav) {
              const params = new URLSearchParams({ module: nav.moduleId });
              if (nav.reportType !== null) params.set("sub", String(nav.reportType));
              updated = {
                ...updated,
                navigation: { label: nav.label, href: `/report?${params.toString()}` },
              };
            }

            return updated;
          })
        );
        // A brand-new conversation now has a session — surface it in history.
        if (wasNewChat && sessionIdRef.current) refreshHistory();
      } catch {
        if (controller.signal.aborted) return;
        const friendly =
          "Sorry, I couldn't complete that response. Please try again.";
        if (!started) {
          setMessages((prev) => [
            ...prev,
            {
              id: aiId,
              role: "ai",
              text: friendly,
              time: formatTime(new Date()),
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiId
                ? { ...message, text: `${message.text}\n\n${friendly}` }
                : message
            )
          );
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setIsThinking(false);
        setIsResponding(false);
      }
    },
    [isResponding, quotaReached, nextId, applyUsage, refreshHistory]
  );

  return {
    messages,
    sessionId,
    isThinking,
    isResponding,
    promptsUsed,
    promptLimit,
    unlimited,
    quotaReached,
    resetsAt,
    userName,
    history,
    historyLoading,
    refreshHistory,
    refreshQuota: () => refreshQuota(),
    loadSession,
    deleteSession,
    sendMessage,
    startNewChat,
  };
};

export default useAiChat;
