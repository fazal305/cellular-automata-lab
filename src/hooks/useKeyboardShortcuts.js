import { useEffect, useRef } from 'react';
import { KEYBOARD_SHORTCUTS } from '../config/constants.js';

/**
 * Subscribes to global keydown events and dispatches to named handlers based
 * on the shortcut map in config/constants.js.
 *
 * `handlers` is stored in a ref and refreshed every render without
 * re-attaching the listener, so callers can pass a fresh object each render
 * (e.g. inline in JSX) without causing repeated addEventListener/
 * removeEventListener churn.
 *
 * @param {Record<string, (event: KeyboardEvent) => void>} handlers - keyed
 *   by the `action` names used in KEYBOARD_SHORTCUTS (e.g. `toggleRunning`).
 * @param {{ enabled?: boolean }} [options] - set enabled: false to suspend
 *   shortcuts, e.g. while a modal with its own key handling is open.
 */
export function useKeyboardShortcuts(handlers, { enabled = true } = {}) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event) => {
      const target = event.target;
      const isTypingIntoField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTypingIntoField) return;

      const shortcut = KEYBOARD_SHORTCUTS.find(
        (entry) => entry.key.toLowerCase() === event.key.toLowerCase()
      );
      if (!shortcut) return;

      const handler = handlersRef.current[shortcut.action];
      if (!handler) return;

      event.preventDefault();
      handler(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
