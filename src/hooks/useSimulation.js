import { useCallback, useMemo, useRef, useState } from 'react';
import {
  createGrid,
  setCell as setGridCellValue,
  randomizeGrid,
  resizeGrid,
  stampPattern,
} from '../simulation/grid.js';
import { simulateGeneration, computeGridStats } from '../simulation/simulationEngine.js';
import { getRuleById, DEFAULT_RULE_ID } from '../simulation/rules.js';
import { GRID_LIMITS, SPEED_PRESETS, DEFAULT_SPEED_ID, DEFAULT_RANDOMIZE_DENSITY } from '../config/constants.js';
import { useAnimationLoop } from './useAnimationLoop.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function findSpeedPreset(speedId) {
  return SPEED_PRESETS.find((preset) => preset.id === speedId) ?? SPEED_PRESETS[0];
}

/**
 * Owns the full simulation lifecycle: grid data, generation count, run/pause
 * state, rule/speed selection, and stepping.
 *
 * The live grid itself is NOT React state — it's a Uint8Array held in a ref
 * (`gridRef`). Putting 10,000+ cells into useState would mean React diffing
 * or copying that array on every single generation, dozens of times a
 * second at high speed. Instead, `gridVersion` is a small integer that
 * increments on every mutation; consumers (SimulationCanvas) depend on it to
 * know *when* to redraw, then read the actual cells straight from
 * `gridRef.current`. This is the boundary described in the architecture
 * docs: React tracks *that* something changed, Canvas handles *what* changed.
 */
export function useSimulation(options = {}) {
  const {
    initialWidth = GRID_LIMITS.defaultWidth,
    initialHeight = GRID_LIMITS.defaultHeight,
    initialRuleId = DEFAULT_RULE_ID,
    initialSpeedId = DEFAULT_SPEED_ID,
    initialWrapEdges = false,
  } = options;

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [ruleId, setRuleId] = useState(initialRuleId);
  const [speedId, setSpeedId] = useState(initialSpeedId);
  const [wrapEdges, setWrapEdges] = useState(initialWrapEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [gridVersion, setGridVersion] = useState(0);

  const gridRef = useRef(createGrid(initialWidth, initialHeight));
  const lastStepDurationRef = useRef(0);
  const accumulatedElapsedMsRef = useRef(0);
  const runStartedAtRef = useRef(0);

  const rule = useMemo(() => getRuleById(ruleId), [ruleId]);
  const speedPreset = useMemo(() => findSpeedPreset(speedId), [speedId]);
  const intervalMs = 1000 / speedPreset.generationsPerSecond;

  const getGrid = useCallback(() => gridRef.current, []);

  const step = useCallback(() => {
    const startTime = performance.now();
    gridRef.current = simulateGeneration(gridRef.current, width, height, rule, { wrapEdges });
    lastStepDurationRef.current = performance.now() - startTime;

    setGeneration((currentGeneration) => currentGeneration + 1);
    setGridVersion((currentVersion) => currentVersion + 1);
  }, [width, height, rule, wrapEdges]);

  useAnimationLoop(step, { isRunning, intervalMs });

  const start = useCallback(() => {
    runStartedAtRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    accumulatedElapsedMsRef.current += performance.now() - runStartedAtRef.current;
    setIsRunning(false);
  }, []);

  // Wall-clock time the simulation has spent actually running, excluding
  // paused stretches. Accumulated across play/pause cycles in a ref rather
  // than a ticking React state, since nothing here needs a re-render every
  // second — StatisticsPanel polls this on its own schedule to display it.
  const getElapsedMs = useCallback(() => {
    const runningStretch = isRunning ? performance.now() - runStartedAtRef.current : 0;
    return accumulatedElapsedMsRef.current + runningStretch;
  }, [isRunning]);

  const reset = useCallback(() => {
    gridRef.current = createGrid(width, height);
    setIsRunning(false);
    setGeneration(0);
    accumulatedElapsedMsRef.current = 0;
    runStartedAtRef.current = performance.now();
    setGridVersion((currentVersion) => currentVersion + 1);
  }, [width, height]);

  const clear = useCallback(() => {
    gridRef.current.fill(0);
    setGridVersion((currentVersion) => currentVersion + 1);
  }, []);

  const randomize = useCallback((density = DEFAULT_RANDOMIZE_DENSITY) => {
    randomizeGrid(gridRef.current, density);
    setGeneration(0);
    setGridVersion((currentVersion) => currentVersion + 1);
  }, []);

  const setCell = useCallback((x, y, value) => {
    setGridCellValue(gridRef.current, width, x, y, value);
    setGridVersion((currentVersion) => currentVersion + 1);
  }, [width]);

  const setGridSize = useCallback((nextWidth, nextHeight) => {
    const clampedWidth = clamp(nextWidth, GRID_LIMITS.minWidth, GRID_LIMITS.maxWidth);
    const clampedHeight = clamp(nextHeight, GRID_LIMITS.minHeight, GRID_LIMITS.maxHeight);

    gridRef.current = resizeGrid(gridRef.current, width, height, clampedWidth, clampedHeight);
    setWidth(clampedWidth);
    setHeight(clampedHeight);
    setGeneration(0);
    setGridVersion((currentVersion) => currentVersion + 1);
  }, [width, height]);

  // Stats are derived on demand rather than kept in state, since not every
  // consumer needs them recomputed on every gridVersion bump.
  const getStats = useCallback(
    () => computeGridStats(gridRef.current, width, height),
    [width, height]
  );

  // Non-destructive: stamps a pattern onto the CURRENT grid without
  // resizing or clearing it, so placing a pattern from the library doesn't
  // erase whatever else the user has drawn.
  const placePattern = useCallback((pattern, originX, originY) => {
    stampPattern(gridRef.current, width, height, pattern.cells, originX, originY);
    setGridVersion((currentVersion) => currentVersion + 1);
  }, [width, height]);

  // Atomically reconfigures the whole simulation — grid size, rule,
  // wrap-around, and starting content — in one step. Used for presets,
  // where composing setGridSize + setRuleId + placePattern separately would
  // read stale width/height (React state hasn't updated mid-handler yet).
  const loadScenario = useCallback(({
    width: nextWidth,
    height: nextHeight,
    ruleId: nextRuleId,
    wrapEdges: nextWrapEdges,
    pattern,
    randomize: shouldRandomize,
    randomizeDensity,
  }) => {
    const clampedWidth = clamp(nextWidth, GRID_LIMITS.minWidth, GRID_LIMITS.maxWidth);
    const clampedHeight = clamp(nextHeight, GRID_LIMITS.minHeight, GRID_LIMITS.maxHeight);
    const nextGrid = createGrid(clampedWidth, clampedHeight);

    if (pattern) {
      const originX = Math.floor((clampedWidth - pattern.width) / 2);
      const originY = Math.floor((clampedHeight - pattern.height) / 2);
      stampPattern(nextGrid, clampedWidth, clampedHeight, pattern.cells, originX, originY);
    } else if (shouldRandomize) {
      randomizeGrid(nextGrid, randomizeDensity ?? DEFAULT_RANDOMIZE_DENSITY);
    }

    gridRef.current = nextGrid;
    setWidth(clampedWidth);
    setHeight(clampedHeight);
    if (nextRuleId) setRuleId(nextRuleId);
    if (typeof nextWrapEdges === 'boolean') setWrapEdges(nextWrapEdges);
    setIsRunning(false);
    setGeneration(0);
    accumulatedElapsedMsRef.current = 0;
    runStartedAtRef.current = performance.now();
    setGridVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    getGrid,
    gridVersion,
    width,
    height,
    generation,
    isRunning,
    rule,
    ruleId,
    setRuleId,
    speedId,
    setSpeedId,
    speedPresets: SPEED_PRESETS,
    wrapEdges,
    setWrapEdges,
    start,
    stop,
    step,
    reset,
    clear,
    randomize,
    setCell,
    setGridSize,
    placePattern,
    loadScenario,
    getStats,
    getElapsedMs,
    lastStepDurationRef,
  };
}
