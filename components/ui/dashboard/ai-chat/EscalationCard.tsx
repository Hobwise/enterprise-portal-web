"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Headphones, Paperclip, Send, X } from "lucide-react";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { sendEscalationMail } from "./agentChatApi";

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@hobwise.com";

const resolveContext = () => {
  const user = getJsonItemFromLocalStorage("userInformation");
  const business = getJsonItemFromLocalStorage("business");
  const userEmail = user?.email ?? "";
  const userName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.fullName ||
    "Unknown User";
  const businessName =
    business?.[0]?.businessName ?? business?.[0]?.name ?? "Unknown Business";
  return { userName, userEmail, businessName };
};

const buildDefaultContent = (
  userMessage: string,
  aiReply: string,
  userName: string,
  businessName: string
) =>
  [
    "Hi HOBWISE Support Team,",
    "",
    "I need help with an issue that the AI could not fully resolve.",
    "",
    "--- AI Conversation ---",
    `My question: ${userMessage}`,
    "",
    `AI response: ${aiReply}`,
    "--- End of AI Conversation ---",
    "",
    `Business: ${businessName}`,
    `User: ${userName}`,
    `Date: ${new Date().toLocaleString()}`,
    "",
    "Please follow up at your earliest convenience.",
  ].join("\n");

interface EscalationCardProps {
  userMessage: string;
  aiReply: string;
}

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-textGrey placeholder:text-grey400 focus:border-amber-400 focus:outline-none";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <span className="w-14 shrink-0 pt-1.5 text-xs font-semibold text-amber-800">
      {label}
    </span>
    <div className="flex-1">{children}</div>
  </div>
);

const EscalationCard = ({ userMessage, aiReply }: EscalationCardProps) => {
  const { userName, userEmail, businessName } = resolveContext();

  const [to] = useState(SUPPORT_EMAIL);
  const [from, setFrom] = useState(userEmail);
  const [subject, setSubject] = useState(
    `Support Request — ${businessName} — HOBWISE AI`
  );
  const [cc, setCc] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = content.trim().length > 0 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const aiContext = buildDefaultContent(userMessage, aiReply, userName, businessName);
      const fullContent = content.trim()
        ? `${content.trim()}\n\n${aiContext}`
        : aiContext;

      const ok = await sendEscalationMail(
        { To: to, From: from, Subject: subject, Cc: cc || undefined, Content: fullContent },
        attachment
      );
      if (ok) {
        setSent(true);
      } else {
        setError("Failed to send. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-green-800">Message sent!</p>
            <p className="mt-0.5 text-xs text-green-700">
              Our support team will follow up shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Headphones className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Flagged for human support
          </p>
          <p className="text-xs text-amber-700">
            This issue has been flagged. Fill in the details and send to our
            team.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-2 rounded-xl border border-amber-200 bg-white p-3">
        <Field label="To">
          <input
            type="text"
            value={to}
            readOnly
            className={`${inputClass} cursor-default bg-amber-50 text-amber-700`}
          />
        </Field>

        <Field label="From">
          <input
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="your@email.com"
            className={inputClass}
          />
        </Field>

        <Field label="Subject">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className={inputClass}
          />
        </Field>

        <Field label="Cc">
          <input
            type="text"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </Field>

        <Field label="Content">
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your issue…"
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Attachment">
          {attachment ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
              <Paperclip className="h-3 w-3 shrink-0 text-amber-700" />
              <span className="flex-1 truncate text-xs text-amber-800">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-amber-600 hover:text-amber-900"
                aria-label="Remove attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 transition-colors hover:bg-amber-100"
            >
              <Paperclip className="h-3 w-3" />
              Choose file
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
          />
        </Field>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-3 w-3" />
        {sending ? "Sending…" : "Send to Support"}
      </button>
    </div>
  );
};

export default EscalationCard;
