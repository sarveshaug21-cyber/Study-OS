"use client";
import { useEffect } from "react";
// Adapted concept from studyflow-timetable's useKeyboardShortcuts (React hook pattern).
// ⌘K handled by SearchBar; here: j/k navigation + Esc to close (documented for the app shell).
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onEscape(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape]);
}
