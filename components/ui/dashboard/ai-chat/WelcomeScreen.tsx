"use client";

import { Boxes, CalendarPlus, MessagesSquare, QrCode, type LucideIcon } from "lucide-react";
import SparkleIcon from "./SparkleIcon";

interface Suggestion {
  icon: LucideIcon;
  label: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  { icon: MessagesSquare, label: "Sales", prompt: "What was the average sales yesterday?" },
  { icon: CalendarPlus, label: "Reservation", prompt: "How do I book a reservation?" },
  { icon: Boxes, label: "Stock", prompt: "How do I transfer stock to a new location?" },
  { icon: QrCode, label: "QR Reports", prompt: "Where do I view QR reports?" },
];

interface WelcomeScreenProps {
  userName: string;
  onSuggestion: (prompt: string) => void;
}

const WelcomeScreen = ({ userName, onSuggestion }: WelcomeScreenProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primaryColor to-secondaryColor text-white shadow-md">
        <SparkleIcon className="h-7 w-7" />
      </span>
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-dark">Hi {userName} 👋</h3>
        <p className="mx-auto max-w-xs text-sm text-grey500">
          Ask me anything about your business, HOBWISE platform, or hospitality
          best practices.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {SUGGESTIONS.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.label}
                type="button"
                title={suggestion.prompt}
                onClick={() => onSuggestion(suggestion.prompt)}
                className="flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-grey300 px-3 py-1.5 text-xs font-medium text-textGrey transition-colors hover:border-primaryColor/30 hover:bg-primaryColor/5 hover:text-primaryColor"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{suggestion.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
