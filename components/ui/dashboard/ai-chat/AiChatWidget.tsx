"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AiChatButton from "./AiChatButton";
import AiChatPanel from "./AiChatPanel";
import useAiChat from "./useAiChat";

/**
 * Single mounted entry point for the Hospira AI assistant. Renders the floating
 * button when closed and the chat panel when open. Mounted once in the
 * dashboard layout so it is available across every `/dashboard/*` page.
 */
const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const chat = useAiChat();
  // Full-viewport boundary the draggable button is kept within.
  const dragBoundsRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setExpanded(false);
    setOpen(true);
  };

  return (
    <>
      {/* Drag boundary spans the viewport but lets clicks through to the page;
          only the button inside re-enables pointer events. */}
      <div
        ref={dragBoundsRef}
        className="pointer-events-none fixed inset-0 z-40"
      >
        {!open && (
          <AiChatButton onClick={handleOpen} dragConstraints={dragBoundsRef} />
        )}
      </div>
      <AnimatePresence>
        {open && (
          <AiChatPanel
            chat={chat}
            expanded={expanded}
            onToggleExpand={() => setExpanded((prev) => !prev)}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatWidget;
