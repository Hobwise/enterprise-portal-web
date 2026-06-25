export type ChatRole = "user" | "ai";

export interface MessageAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface NavigationHint {
  label: string;
  href: string;
}

export interface NavButton {
  label: string;
  href: string;
}

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  text: string;
  /** Pre-formatted timestamp, e.g. "1:52pm". */
  time: string;
  /** Optional CTA chip rendered beneath an AI message. */
  action?: MessageAction;
  /** Navigation chip shown below the AI bubble on the final done event. */
  navigation?: NavigationHint;
  /** Navigation buttons parsed from [NAV:...] tokens in the AI response. */
  navButtons?: NavButton[];
  /** True when the AI flags escalation — shows the support notice. */
  escalate?: boolean;
  /** True once the escalation email has been sent — shows the sent confirmation. */
  escalationSent?: boolean;
  /** The user question that triggered this AI reply (passed to escalation card). */
  userPrompt?: string;
}
