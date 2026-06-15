"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import { ChatMessageData, NavButton } from "./types";
import { NAV_TOKEN_RE, resolveNavToken } from "./navTokens";
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

const ESCALATE_TOKEN = /\[ESCALATE\]/gi;

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

  // Current conversation. `null` => new chat: no sessionId is sent, and the
  // backend mints one (returned on the terminal `done` event).
  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const idCounter = useRef(0);

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${idCounter.current}`;
  }, []);

  const applyUsage = useCallback((event: AgentChatEvent) => {
    if (event.sessionId) sessionIdRef.current = event.sessionId;
    if (event.usage) {
      setPromptsUsed(event.usage.used);
      setUnlimited(event.usage.isUnlimited || event.usage.limit < 0);
      if (event.usage.limit >= 0) setPromptLimit(event.usage.limit);
      if (event.usage.resetsAt) setResetsAt(event.usage.resetsAt);
    }
  }, []);

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
    sessionIdRef.current = null;
    setMessages([]);
    setIsThinking(false);
    setIsResponding(false);
  }, []);

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
      sessionIdRef.current = sessionId;
      setMessages(
        ordered.map((message) => ({
          id: message.id,
          role: roleToUi(message.role),
          text: message.content,
          time: formatTime(new Date(message.dateCreated)),
        }))
      );
    },
    []
  );

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
        // Apply navigation hint and escalation flag from the terminal done event.
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== aiId) return m;
            let updated = { ...m };

            const shouldEscalate = doneEvent?.escalate || ESCALATE_TOKEN.test(m.text);
            if (shouldEscalate) {
              updated = {
                ...updated,
                text: updated.text.replace(ESCALATE_TOKEN, "").trim(),
                escalate: true,
                userPrompt: trimmed,
              };
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

            NAV_TOKEN_RE.lastIndex = 0;
            const navMatches = [...updated.text.matchAll(NAV_TOKEN_RE)];
            if (navMatches.length > 0) {
              const navButtons = navMatches
                .map((m) => resolveNavToken(m[1]))
                .filter((b): b is NavButton => b !== null);
              NAV_TOKEN_RE.lastIndex = 0;
              updated = {
                ...updated,
                text: updated.text.replace(NAV_TOKEN_RE, '').trim(),
                ...(navButtons.length > 0 && { navButtons }),
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
