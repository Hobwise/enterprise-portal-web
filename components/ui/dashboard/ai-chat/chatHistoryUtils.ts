import moment from "moment";
import { AgentHistoryItem } from "./agentChatApi";

export interface HistoryGroup {
  label: string;
  items: AgentHistoryItem[];
}

/** Human-friendly day label: Today / Yesterday / "Mar 12, 2026". */
export const relativeDayLabel = (value: string): string => {
  const date = moment(value);
  if (!date.isValid()) return "Earlier";
  if (date.isSame(moment(), "day")) return "Today";
  if (date.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  return date.format("MMM D, YYYY");
};

/**
 * Groups sessions (assumed most-recent-first) under day headings, preserving
 * order. Returns at most `limit` items total when provided (for previews).
 */
export const groupHistoryByDay = (
  history: AgentHistoryItem[],
  limit?: number
): HistoryGroup[] => {
  const source =
    typeof limit === "number" ? history.slice(0, limit) : history;
  const groups: HistoryGroup[] = [];
  source.forEach((item) => {
    const label = relativeDayLabel(item.lastActive);
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  });
  return groups;
};
