"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Mic, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import useVoiceInput from "./useVoiceInput";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Placeholder shown when the daily prompt quota is exhausted. */
  quotaReached?: boolean;
  /** Reports voice support so the footer can reflect it. */
  onVoiceSupportChange?: (supported: boolean) => void;
}

const MAX_TEXTAREA_HEIGHT = 140;

const ChatInput = ({
  onSend,
  disabled,
  quotaReached,
  onVoiceSupportChange,
}: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Text already typed before voice dictation began, so transcripts append.
  const voiceBaseRef = useRef("");

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, []);

  const voice = useVoiceInput({
    onTranscript: (transcript) => {
      const base = voiceBaseRef.current;
      setValue(base ? `${base} ${transcript}`.trim() : transcript);
    },
  });

  useEffect(() => {
    onVoiceSupportChange?.(voice.supported);
  }, [voice.supported, onVoiceSupportChange]);

  // Re-measure whenever the value changes (typing, dictation, or reset).
  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  const canSend = value.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    if (voice.listening) voice.stop();
    onSend(value);
    setValue("");
    voiceBaseRef.current = "";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (disabled) return;
    if (voice.listening) {
      voice.stop();
      return;
    }
    voiceBaseRef.current = value.trim();
    voice.start();
  };

  const placeholder = quotaReached
    ? "You've reached today's prompt limit"
    : voice.listening
    ? "Listening..."
    : "How can i help you today";

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-2xl border bg-aiChatInput px-4 py-3 transition-colors",
        voice.listening ? "border-red-400" : "border-primaryColor/30"
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          setValue(event.target.value);
          voiceBaseRef.current = event.target.value.trim();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Message Hospira AI"
        className="scrollbar-hide flex-1 resize-none self-center bg-transparent text-sm text-textGrey placeholder:text-grey500 focus:outline-none disabled:cursor-not-allowed"
        style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled || !voice.supported}
          aria-label={voice.listening ? "Stop voice input" : "Start voice input"}
          aria-pressed={voice.listening}
          title={voice.supported ? undefined : "Voice input is not supported in this browser"}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            voice.listening
              ? "animate-pulse border-red-400 bg-red-500 text-white"
              : "border-secondaryGrey bg-white text-grey500 hover:text-primaryColor"
          )}
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primaryColor text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
