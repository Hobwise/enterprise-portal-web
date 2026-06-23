import { getJsonItemFromLocalStorage } from "@/lib/utils";

/**
 * Streaming client for the Hospira AI agent. Chat responses are delivered as
 * Server-Sent Events, so we use `fetch` + `ReadableStream` here rather than the
 * shared axios instance (which buffers the whole body and can't stream).
 */

const API_VERSION = 1;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export interface AgentUsage {
  plan: number;
  planLabel: string;
  used: number;
  limit: number;
  isUnlimited: boolean;
  remaining: number;
  resetsAt: string;
}

export interface AgentNavigation {
  label: string;
  moduleId: string;
  reportType: number | null;
}

export interface AgentChatEvent {
  delta: string;
  done: boolean;
  sessionId: string | null;
  usage: AgentUsage | null;
  navigation: AgentNavigation | null;
  intent: string | null;
  escalate: boolean;
}

export interface AgentQuota {
  allowed: boolean;
  plan: number;
  used: number;
  limit: number;
  message: string;
  resetsAt: string;
}

export interface AgentHistoryItem {
  sessionId: string;
  title: string;
  lastActive: string;
  messageCount: number;
}

/** role: 0 = user, 1 = assistant. */
export interface AgentSessionMessage {
  role: number;
  id: string;
  content: string;
  dateCreated: string;
}

const authHeaders = (): Record<string, string> => {
  const userInfo = getJsonItemFromLocalStorage("userInformation");
  const business = getJsonItemFromLocalStorage("business");
  const token = userInfo?.token;
  const businessId = business?.[0]?.businessId;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(businessId ? { businessId } : {}),
  };
};

const parseSseEvent = (raw: string): AgentChatEvent | null => {
  const json = raw
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("");
  if (!json || json === "[DONE]") return null;
  try {
    return JSON.parse(json) as AgentChatEvent;
  } catch {
    return null;
  }
};

export interface StreamAgentChatArgs {
  message: string;
  /** Omit for a new chat; pass to continue an existing conversation. */
  sessionId?: string | null;
  signal?: AbortSignal;
  /** Called for every text fragment as it streams in. */
  onDelta: (text: string) => void;
  /** Called for every parsed SSE event (including the final `done` event). */
  onEvent?: (event: AgentChatEvent) => void;
}

/**
 * Streams a chat reply, invoking `onDelta` for each text fragment. Resolves with
 * the terminal `done` event (carrying the sessionId + usage) once the stream
 * completes. A new chat must NOT send a sessionId — the backend creates one and
 * returns it in the final event.
 */
export const streamAgentChat = async ({
  message,
  sessionId,
  signal,
  onDelta,
  onEvent,
}: StreamAgentChatArgs): Promise<AgentChatEvent | null> => {
  const userInfo = getJsonItemFromLocalStorage("userInformation");
  const userId = userInfo?.id;

  const body: Record<string, unknown> = { message, userId };
  if (sessionId) body.sessionId = sessionId;

  const response = await fetch(`${BASE_URL}api/v${API_VERSION}/Agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Agent chat request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastEvent: AgentChatEvent | null = null;

  const handleEvent = (event: AgentChatEvent) => {
    lastEvent = event;
    if (event.delta) onDelta(event.delta);
    onEvent?.(event);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    // Normalise CRLF so the `\n\n` event boundary parses regardless of the
    // server's line endings.
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let separator = buffer.indexOf("\n\n");
    while (separator !== -1) {
      const rawEvent = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 2);
      const event = parseSseEvent(rawEvent);
      if (event) {
        handleEvent(event);
        if (event.done) {
          await reader.cancel().catch(() => undefined);
          return event;
        }
      }
      separator = buffer.indexOf("\n\n");
    }
  }

  // Flush any trailing event that wasn't terminated by a blank line.
  const trailing = parseSseEvent(buffer);
  if (trailing) handleEvent(trailing);

  return lastEvent;
};

/** Fetches the caller's daily prompt quota. */
export const getAgentQuota = async (
  signal?: AbortSignal
): Promise<AgentQuota | null> => {
  const response = await fetch(`${BASE_URL}api/v${API_VERSION}/Agent/quota`, {
    method: "GET",
    headers: { Accept: "*/*", ...authHeaders() },
    signal,
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return (payload?.data as AgentQuota | undefined) ?? null;
};

/** Lists the caller's past chat sessions (most recent first). */
export const getAgentHistory = async (
  signal?: AbortSignal
): Promise<AgentHistoryItem[]> => {
  const response = await fetch(`${BASE_URL}api/v${API_VERSION}/Agent/history`, {
    method: "GET",
    headers: { Accept: "*/*", ...authHeaders() },
    signal,
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload?.data as AgentHistoryItem[] | undefined) ?? [];
};

/** Fetches all messages for a single session (unsorted — caller orders them). */
export const getAgentSession = async (
  sessionId: string,
  signal?: AbortSignal
): Promise<AgentSessionMessage[]> => {
  const response = await fetch(
    `${BASE_URL}api/v${API_VERSION}/Agent/history/${sessionId}`,
    { method: "GET", headers: { Accept: "*/*", ...authHeaders() }, signal }
  );
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload?.data as AgentSessionMessage[] | undefined) ?? [];
};

export interface EscalationMailPayload {
  To: string;
  From: string;
  Subject: string;
  Content: string;
  Cc?: string;
  OrderId?: string;
}

/** Sends a support escalation email via the backend agent mailer.
 *  Uses multipart/form-data so an optional file attachment can be included.
 *  A `sessionId` links the escalation to its chat session so it shows in history. */
export const sendEscalationMail = async (
  payload: EscalationMailPayload,
  attachment?: File | null,
  sessionId?: string | null
): Promise<boolean> => {
  const form = new FormData();
  if (payload.OrderId) form.append("OrderId", payload.OrderId);
  form.append("To", payload.To);
  form.append("From", payload.From);
  form.append("Subject", payload.Subject);
  if (payload.Cc) form.append("Cc", payload.Cc);
  form.append("Content", payload.Content);
  if (attachment) form.append("Attachment", attachment);

  const query = sessionId
    ? `?sessionId=${encodeURIComponent(sessionId)}`
    : "";

  const response = await fetch(
    `${BASE_URL}api/v${API_VERSION}/Agent/send-escalation-mail${query}`,
    {
      method: "POST",
      // Let the browser set Content-Type with the multipart boundary automatically.
      headers: { Accept: "*/*", ...authHeaders() },
      body: form,
    }
  );
  return response.ok;
};

/** Permanently deletes a chat session. Resolves true on success. */
export const deleteAgentSession = async (
  sessionId: string
): Promise<boolean> => {
  const response = await fetch(
    `${BASE_URL}api/v${API_VERSION}/Agent/history/${sessionId}`,
    { method: "DELETE", headers: { Accept: "*/*", ...authHeaders() } }
  );
  return response.ok;
};
