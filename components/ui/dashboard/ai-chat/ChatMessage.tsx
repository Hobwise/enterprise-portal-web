"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChatMessageData } from "./types";
import SparkleIcon from "./SparkleIcon";

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
      <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm border border-secondaryGrey bg-white px-4 py-3 text-sm text-textGrey">
        {message.text}
      </div>
      {message.action && (
        <ActionChip action={message.action} />
      )}
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
    <span className="inline-flex items-center gap-3 rounded-xl border border-primaryColor/40 bg-white px-4 py-2 text-sm font-medium text-primaryColor transition-colors hover:bg-primaryColor/5">
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
