"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChatMessageData } from "./types";
import SparkleIcon from "./SparkleIcon";
import EscalationCard from "./EscalationCard";

const ROUTE_RE = /\/dashboard\/reports?(?:\/[\w-]+(?:\/[\w-]+)*)?|\/report(?:\?[\w=&%-]+)?|\/(?:dashboard|pos|business-activities)\/[\w-]+(?:\/[\w-]+)*/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

const SUB_TAB_ALIASES: Record<string, string> = {
  'stock-levels': 'stock-level',
  'stock-transfers': 'stock-transfer',
  'purchase-orders': 'purchase-order',
};

const MODULE_LABELS: Record<string, string> = {
  sales: 'Sales & Orders',
  payments: 'Payment & Revenue',
  bookings: 'Bookings & Reservation',
  inventory: 'Inventory',
  qr: 'QR Code',
  users: 'Users & Audits',
};

const VALID_MODULES = new Set(['sales', 'payments', 'bookings', 'inventory', 'qr', 'users']);

const fmtSub = (s: string) =>
  s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function resolveReportHref(raw: string): { href: string; label: string } | null {
  // /dashboard/reports?/... or /dashboard/report/...
  const dashMatch = raw.match(/^\/dashboard\/reports?(?:\/(.*))?$/);
  if (dashMatch) {
    const parts = (dashMatch[1] ?? '').split('/').filter(Boolean);
    const module = parts[0];
    const rawSub = parts[1];
    if (!module || !VALID_MODULES.has(module)) {
      return { href: '/report', label: 'View Reports' };
    }
    const sub = rawSub ? (SUB_TAB_ALIASES[rawSub] ?? rawSub) : undefined;
    const params = new URLSearchParams({ module });
    if (sub) params.set('sub', sub);
    const moduleLabel = MODULE_LABELS[module] ?? module;
    const label = sub ? `${moduleLabel} · ${fmtSub(sub)}` : moduleLabel;
    return { href: `/report?${params.toString()}`, label };
  }

  // bare /report or /report?...
  if (raw === '/report' || raw.startsWith('/report?')) {
    if (raw === '/report') return { href: '/report', label: 'View Reports' };
    const qs = raw.slice('/report?'.length);
    const params = new URLSearchParams(qs);
    const module = params.get('module');
    const sub = params.get('sub');
    const moduleLabel = module ? (MODULE_LABELS[module] ?? module) : '';
    const label = moduleLabel
      ? sub ? `${moduleLabel} · ${fmtSub(sub)}` : moduleLabel
      : 'View Reports';
    return { href: raw, label };
  }

  return null;
}

function renderRoutes(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  ROUTE_RE.lastIndex = 0;
  while ((m = ROUTE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const resolved = resolveReportHref(m[0]);
    const href = resolved ? resolved.href : m[0];
    const label = resolved ? resolved.label : m[0];
    nodes.push(
      <Link
        key={m.index}
        href={href}
        className="inline-flex items-center gap-1 rounded-md bg-primaryColor/10 px-1.5 py-0.5 font-semibold text-primaryColor transition-colors hover:bg-primaryColor/20"
      >
        <ArrowRight className="h-3 w-3 shrink-0" />
        {label}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderText(raw: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  BOLD_RE.lastIndex = 0;
  while ((m = BOLD_RE.exec(raw)) !== null) {
    if (m.index > last) nodes.push(...renderRoutes(raw.slice(last, m.index)));
    nodes.push(<strong key={key++}>{renderRoutes(m[1])}</strong>);
    last = m.index + m[0].length;
  }
  if (last < raw.length) nodes.push(...renderRoutes(raw.slice(last)));
  return nodes;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

const Avatar = ({ role }: { role: ChatMessageData["role"] }) => {
  if (role === "user") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-grey500 text-[10px] font-medium text-white">
        You
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primaryColor text-white">
      <SparkleIcon className="h-3.5 w-3.5" />
    </span>
  );
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex animate-ai-pop flex-col items-end gap-1">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primaryColor px-4 py-3 text-sm font-medium text-white">
          {message.text}
        </div>
        <div className="flex items-center gap-2 pr-1">
          <span className="text-xs text-grey500">{message.time}</span>
          <Avatar role="user" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-ai-pop flex-col items-start gap-2">
      <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm border border-black/[0.06] bg-grey300 px-4 py-3 text-sm text-textGrey">
        {renderText(message.text)}
      </div>
      {message.action && <ActionChip action={message.action} />}
      {message.escalate && <EscalationCard />}
      <div className="flex items-center gap-2 pl-1">
        <Avatar role="ai" />
        <span className="text-xs text-grey500">{message.time}</span>
      </div>
    </div>
  );
};

const ActionChip = ({
  action,
}: {
  action: NonNullable<ChatMessageData["action"]>;
}) => {
  const content = (
    <span className="inline-flex items-center gap-3 rounded-xl border border-primaryColor/30 bg-primaryColor/5 px-4 py-2 text-sm font-medium text-primaryColor transition-colors hover:bg-primaryColor/10">
      <ArrowRight className="h-4 w-4" />
      {action.label}
    </span>
  );

  if (action.href) {
    return <Link href={action.href}>{content}</Link>;
  }
  return (
    <button type="button" onClick={action.onClick}>
      {content}
    </button>
  );
};

export default ChatMessage;
