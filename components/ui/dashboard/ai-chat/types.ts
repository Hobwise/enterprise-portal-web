export type ChatRole = "user" | "ai";

export interface MessageAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  text: string;
  /** Pre-formatted timestamp, e.g. "1:52pm". */
  time: string;
  /** Optional CTA chip rendered beneath an AI message. */
  action?: MessageAction;
}
