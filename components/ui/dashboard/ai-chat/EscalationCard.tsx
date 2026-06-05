"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { ContactUs } from "@/app/api/controllers/landingPage";
import { getJsonItemFromLocalStorage } from "@/lib/utils";

const SUPPORT_EMAIL = "support@hobwise.com";

const resolveUserInfo = () => {
  const user = getJsonItemFromLocalStorage("userInformation");
  const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.fullName || "";
  const email = user?.email ?? "";
  return { name, email };
};

const EscalationCard = () => {
  const prefill = resolveUserInfo();
  const [name, setName] = useState(prefill.name);
  const [email, setEmail] = useState(prefill.email);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const canSend = name.trim() && email.trim() && message.trim() && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      await ContactUs({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-black/[0.08] bg-aiChatInput px-3 py-2 text-sm text-textGrey placeholder:text-grey400 focus:border-primaryColor/40 focus:outline-none";

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-5 text-center">
        <CheckCircle2 className="h-7 w-7 text-green-500" />
        <p className="text-sm font-semibold text-green-700">Message sent!</p>
        <p className="text-xs text-green-600">We&apos;ll get back to you at {email} soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-primaryColor/20 bg-primaryColor/5 p-4">
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
          <Mail className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-dark">Need more help?</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-xs font-medium text-primaryColor hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Describe your issue…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="w-full rounded-xl bg-primaryColor px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {sending ? "Sending…" : "Send to Support"}
      </button>
    </div>
  );
};

export default EscalationCard;
