"use client";

import SparkleIcon from "./SparkleIcon";

interface AiChatButtonProps {
  onClick: () => void;
}

/**
 * Floating action button that opens the Hospira AI chat. Visual is taken from
 * the provided `Component 21.svg` (rounded purple tile + white sparkle).
 */
const AiChatButton = ({ onClick }: AiChatButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Hospira AI chat"
      className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-3xl bg-white p-[6px] shadow-custom_shadow ring-[3px] ring-primaryColor/10 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <span className="flex h-full w-full items-center justify-center rounded-[18px] bg-primaryColor text-white">
        <SparkleIcon className="h-7 w-7" />
      </span>
    </button>
  );
};

export default AiChatButton;
