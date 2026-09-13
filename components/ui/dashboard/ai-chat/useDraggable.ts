"use client";

import { useEffect, useRef } from "react";
import { useMotionValue } from "framer-motion";

/**
 * Drag position for the Hospira widget, persisted to localStorage so it stays
 * where the user dropped it across navigations and refreshes.
 *
 * Returns motion values for `style={{ x, y }}`, drag lifecycle handlers, and a
 * `wasDragged()` guard so a drag gesture doesn't also fire the element's
 * `onClick` (which would otherwise open the chat right after moving it).
 */
export const useDraggable = (storageKey: string) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const draggedRef = useRef(false);

  // Restore the saved offset on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const pos = JSON.parse(saved);
      if (typeof pos?.x === "number") x.set(pos.x);
      if (typeof pos?.y === "number") y.set(pos.y);
    } catch {
      // Ignore a malformed persisted value.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const onDragStart = () => {
    draggedRef.current = true;
  };

  const onDragEnd = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ x: x.get(), y: y.get() })
      );
    } catch {
      // Ignore storage/serialization errors.
    }
    // Reset after the click event that follows pointerup has been handled, so
    // the click guard sees the drag.
    setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  const wasDragged = () => draggedRef.current;

  return { x, y, onDragStart, onDragEnd, wasDragged };
};

export default useDraggable;
