import { useEffect, useRef } from 'react';

/**
 * Drives a callback at a configurable cadence using requestAnimationFrame,
 * rather than setInterval. rAF is paced to the browser's actual repaint
 * cycle, so it pauses automatically in background tabs and doesn't stack up
 * queued callbacks the way a drifting setInterval can.
 *
 * The callback is stored in a ref and updated on every render without
 * re-subscribing the effect, so identity changes to `callback` (e.g. a new
 * useCallback closure after grid state changes) never tear down and restart
 * the loop — only `isRunning` and `intervalMs` do that.
 *
 * @param {(elapsedMs: number) => void} callback - invoked once per tick.
 * @param {{ isRunning: boolean, intervalMs: number }} options
 */
export function useAnimationLoop(callback, { isRunning, intervalMs }) {
  const callbackRef = useRef(callback);
  const frameIdRef = useRef(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) return undefined;

    lastTickRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - lastTickRef.current;

      if (elapsed >= intervalMs) {
        // Carry the remainder instead of resetting to `now`, so the loop
        // doesn't lose time (and drift slow) when a frame arrives late.
        lastTickRef.current = now - (elapsed % intervalMs);
        callbackRef.current(elapsed);
      }

      frameIdRef.current = requestAnimationFrame(tick);
    };

    frameIdRef.current = requestAnimationFrame(tick);

    // Cleanup cancels the in-flight frame before any re-run of this effect,
    // which guarantees only one loop is ever active at a time.
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [isRunning, intervalMs]);
}
