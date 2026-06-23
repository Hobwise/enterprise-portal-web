"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import SparkleIcon from "./SparkleIcon";
import { useDraggable } from "./useDraggable";

interface AiChatButtonProps {
  onClick: () => void;
  /** Boundary the button is kept within while dragging (the viewport). */
  dragConstraints?: RefObject<Element>;
}

/**
 * Floating action button that opens the Hospira AI chat. Draggable, so users can
 * move it out of the way of content; its position is persisted and a drag does
 * not count as a click (so moving it never opens the chat).
 */
const AiChatButton = ({ onClick, dragConstraints }: AiChatButtonProps) => {
  const { x, y, onDragStart, onDragEnd, wasDragged } =
    useDraggable("hospiraButtonPosition");

  return (
    <motion.button
      type="button"
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={dragConstraints}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ x, y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.08, cursor: "grabbing" }}
      onClick={() => {
        if (!wasDragged()) onClick();
      }}
      aria-label="Open Hospira AI chat (drag to move)"
      className="pointer-events-auto absolute bottom-24 right-6 flex h-16 w-16 cursor-grab items-center justify-center rounded-3xl bg-white p-[6px] shadow-custom_shadow ring-[3px] ring-primaryColor/10 active:cursor-grabbing"
    >
      <span className="flex h-full w-full items-center justify-center rounded-[18px] bg-primaryColor text-white">
        <SparkleIcon className="h-7 w-7" />
      </span>
    </motion.button>
  );
};

export default AiChatButton;
