"use client";

import { useState } from "react";
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

  const handleOpen = () => {
    setExpanded(false);
    setOpen(true);
  };

  return (
    <>
      {!open && <AiChatButton onClick={handleOpen} />}
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
