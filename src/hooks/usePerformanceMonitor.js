import { useCallback, useMemo, useRef, useState } from 'react';

// How often accumulated metrics are flushed into React state. Flushing at
// 2Hz instead of on every recorded event keeps the panel readable and caps
// re-renders regardless of how fast the simulation is actually stepping
// (which can be up to 60 generations/sec at the "Very Fast" preset).
const FLUSH_INTERVAL_MS = 500;

/**
 * Tracks simulation and rendering performance metrics without forcing a
 * React re-render on every animation frame or every generation.
 *
 * `recordGenerationTime`, `recordRenderTime`, and `recordCellsProcessed`
 * are cheap ref writes — call them as often as you like. `recordFrame` is
 * the heartbeat: call it once per rendered frame, and it both tracks FPS
 * and periodically flushes all the latest recorded values into `stats`.
 */
export function usePerformanceMonitor() {
  const frameTimestampsRef = useRef([]);
  const lastFlushRef = useRef(0);
  const latestMetricsRef = useRef({
    generationTimeMs: 0,
    renderTimeMs: 0,
    cellsProcessed: 0,
    activeCells: 0,
  });

  const [stats, setStats] = useState({
    fps: 0,
    generationTimeMs: 0,
    renderTimeMs: 0,
    cellsProcessed: 0,
    activeCells: 0,
  });

  const recordGenerationTime = useCallback((generationTimeMs) => {
    latestMetricsRef.current.generationTimeMs = generationTimeMs;
  }, []);

  const recordRenderTime = useCallback((renderTimeMs) => {
    latestMetricsRef.current.renderTimeMs = renderTimeMs;
  }, []);

  const recordCellsProcessed = useCallback((cellsProcessed, activeCells) => {
    latestMetricsRef.current.cellsProcessed = cellsProcessed;
    latestMetricsRef.current.activeCells = activeCells;
  }, []);

  const recordFrame = useCallback((now = performance.now()) => {
    const timestamps = frameTimestampsRef.current;
    timestamps.push(now);

    const oneSecondAgo = now - 1000;
    while (timestamps.length > 0 && timestamps[0] < oneSecondAgo) {
      timestamps.shift();
    }

    if (now - lastFlushRef.current >= FLUSH_INTERVAL_MS) {
      lastFlushRef.current = now;
      setStats({ fps: timestamps.length, ...latestMetricsRef.current });
    }
  }, []);

  // Memoized so this object's identity is stable across renders where
  // `stats` hasn't changed — the recorder functions are already stable
  // (empty-deps useCallback), so without this, consumers wrapped in
  // React.memo (e.g. SimulationCanvas) would still re-render on every
  // unrelated App render just because they received a fresh object.
  return useMemo(
    () => ({ stats, recordFrame, recordGenerationTime, recordRenderTime, recordCellsProcessed }),
    [stats, recordFrame, recordGenerationTime, recordRenderTime, recordCellsProcessed]
  );
}
