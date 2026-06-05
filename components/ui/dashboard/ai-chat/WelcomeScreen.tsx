"use client";

import {
  Boxes,
  CalendarPlus,
  MessagesSquare,
  QrCode,
  LucideIcon,
} from "lucide-react";

interface Suggestion {
  icon: LucideIcon;
  label: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: MessagesSquare,
    label: "What was the average sales ye…?",
    prompt: "What was the average sales yesterday?",
  },
  {
    icon: CalendarPlus,
    label: "How do i create a reservation?",
    prompt: "How do I create a reservation?",
  },
  {
    icon: Boxes,
    label: "How do i transfer stock to new…?",
    prompt: "How do I transfer stock to a new location?",
  },
  {
    icon: QrCode,
    label: "Where do i view QR reports?",
    prompt: "Where do I view QR reports?",
  },
];

interface WelcomeScreenProps {
  userName: string;
  onSuggestion: (prompt: string) => void;
}

const WelcomeScreen = ({
  userName,
  onSuggestion,
}: WelcomeScreenProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4 text-center">
        <h3 className="text-2xl font-bold text-dark">Good Day, {userName}</h3>
        <p className="mx-auto max-w-sm text-sm text-grey500">
          Ask me anything about your business, HOBWISE platform, or hospitality
          best practices.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-center text-xs font-semibold tracking-wide text-grey500">
          WHAT CAN I HELP YOU WITH?
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => onSuggestion(suggestion.prompt)}
                className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-grey300 px-4 py-3 text-left transition-colors hover:border-primaryColor/30 hover:bg-primaryColor/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="line-clamp-1 text-sm font-medium text-textGrey">
                  {suggestion.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default WelcomeScreen;
