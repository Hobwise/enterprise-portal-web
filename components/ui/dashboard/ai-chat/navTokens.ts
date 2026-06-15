import { NavButton } from "./types";

/**
 * Single source of truth for the inline `[NAV:...]` navigation tokens the AI
 * embeds in its replies (e.g. `[NAV:sales:0]`, `[NAV:inventory:items]`).
 *
 * Both the streaming reducer (`useAiChat.ts`) and the message renderer
 * (`ChatMessage.tsx`) import from here so the token → route mapping stays in
 * one place.
 */

/** Matches a single `[NAV:token]` marker, capturing the token (e.g. `sales:0`). */
export const NAV_TOKEN_RE = /\[NAV:([\w-]+(?::[\w-]+)*)\]/gi;

/** Exact-token routes for dashboard pages that are not report modules. */
export const NAV_ROUTE_MAP: Record<string, NavButton> = {
  bookings:                     { href: '/dashboard/bookings',                   label: 'Bookings' },
  orders:                       { href: '/dashboard/orders',                     label: 'Orders' },
  payments:                     { href: '/dashboard/payments',                   label: 'Payments' },
  menu:                         { href: '/dashboard/menu',                       label: 'Menu' },
  campaigns:                    { href: '/dashboard/campaigns',                  label: 'Campaigns' },
  reservation:                  { href: '/dashboard/reservation',                label: 'Reservation' },
  'quick-response':             { href: '/dashboard/quick-response',             label: 'Quick Response' },
  qr:                           { href: '/report?module=qr',                     label: 'QR Code Report' },
  settings:                     { href: '/dashboard/settings',                   label: 'Settings' },
  reports:                      { href: '/dashboard/reports',                    label: 'Reports' },
  inventory:                    { href: '/dashboard/inventory',                  label: 'Inventory' },
  'inventory:items':            { href: '/dashboard/inventory/items',            label: 'Inventory Items' },
  'inventory:suppliers':        { href: '/dashboard/inventory/suppliers',        label: 'Suppliers' },
  'inventory:purchase-order':   { href: '/dashboard/inventory/purchase-order',   label: 'Purchase Order' },
  'inventory:stock-transfer':   { href: '/dashboard/inventory/stock-transfer',   label: 'Stock Transfer' },
  'inventory:stock-adjustment': { href: '/dashboard/inventory/stock-adjustment', label: 'Stock Adjustment' },
  'inventory:inventory-count':  { href: '/dashboard/inventory/inventory-count',  label: 'Inventory Count' },
};

/** Report sub-tab slug aliases (plural/legacy → canonical). */
export const SUB_TAB_ALIASES: Record<string, string> = {
  'stock-levels': 'stock-level',
  'stock-transfers': 'stock-transfer',
  'purchase-orders': 'purchase-order',
};

/** Display labels for the `/report?module=<module>` views. */
export const MODULE_LABELS: Record<string, string> = {
  sales: 'Sales & Orders',
  payments: 'Payment & Revenue',
  bookings: 'Bookings & Reservation',
  inventory: 'Inventory',
  qr: 'QR Code',
  users: 'Users & Audits',
};

/** Modules that resolve to the `/report` page. */
export const VALID_MODULES = new Set(['sales', 'payments', 'bookings', 'inventory', 'qr', 'users']);

/** Title-cases a hyphenated sub-tab slug, e.g. `stock-transfer` → `Stock Transfer`. */
export const fmtSub = (s: string): string =>
  s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * Resolve a `[NAV:...]` token to a navigation button.
 *
 * 1. Exact dashboard routes win (`inventory:items` → `/dashboard/inventory/items`).
 * 2. Report modules build `/report?module=<module>` hrefs. A trailing *named*
 *    sub-tab adds `&sub=<sub>`; a purely numeric sub-index (e.g. the `0` in
 *    `sales:0`) is a placeholder and is dropped.
 * 3. Anything unknown returns `null` (no button rendered).
 */
export const resolveNavToken = (token: string): NavButton | null => {
  const key = token.toLowerCase();

  const exact = NAV_ROUTE_MAP[key];
  if (exact) return exact;

  const [module, rawSub] = key.split(':');
  if (VALID_MODULES.has(module)) {
    const params = new URLSearchParams({ module });
    let label = MODULE_LABELS[module] ?? module;
    if (rawSub && !/^\d+$/.test(rawSub)) {
      const sub = SUB_TAB_ALIASES[rawSub] ?? rawSub;
      params.set('sub', sub);
      label = `${label} · ${fmtSub(sub)}`;
    }
    return { href: `/report?${params.toString()}`, label };
  }

  return null;
};

export interface ExtractedNav {
  /** The message text with every `[NAV:...]` marker removed and trimmed. */
  cleanedText: string;
  /** Buttons resolved from the markers (unknown tokens are skipped). */
  navButtons: NavButton[];
}

/**
 * Strip all `[NAV:...]` markers from `text` and return the cleaned text plus
 * the resolved navigation buttons.
 */
export const extractNavTokens = (text: string): ExtractedNav => {
  const navButtons: NavButton[] = [];
  NAV_TOKEN_RE.lastIndex = 0;
  const cleanedText = text
    .replace(NAV_TOKEN_RE, (_match, token: string) => {
      const entry = resolveNavToken(token);
      if (entry) navButtons.push(entry);
      return '';
    })
    .trim();
  return { cleanedText, navButtons };
};
