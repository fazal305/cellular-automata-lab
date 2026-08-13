import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas.js';
import { useAnimationLoop } from '../hooks/useAnimationLoop.js';
import { screenToGridCell, getVisibleCellRange, clampZoom } from '../utils/coordinates.js';
import { CAMERA_LIMITS, DRAW_GRID_LINES_MIN_CELL_PX } from '../config/constants.js';

const DRAW_LOOP_INTERVAL_MS = 1000 / 120;

/**
 * The primary simulation renderer.
 *
 * Deliberately a single <canvas> rather than one React element per cell.
 * A 200x150 grid is 30,000 cells; mounting 30,000 <div>/<Cell> components
 * and diffing them through React's reconciler every generation would tank
 * frame rate long before it tanks from the simulation math itself. Canvas
 * lets us draw all 30,000 cells with plain fillRect calls in a tight loop —
 * no VDOM, no per-cell component overhead, no reconciliation.
 *
 * The grid data itself is never held in this component's React state either:
 * it's read fresh from `getGrid()` (backed by useSimulation's ref) on every
 * draw. `gridVersion` is the only piece of grid-related React state this
 * component depends on, purely as a "something changed, redraw" signal.
 */
// Memoized because App re-renders on state that has nothing to do with the
// canvas (e.g. preferences, sidebar toggling) — the canvas itself only
// needs to re-render (cheaply re-attach the same event handlers) when its
// own props actually change; the grid content update path bypasses React
// entirely via the gridVersion + getGrid ref pattern described above.
function SimulationCanvas({
  getGrid,
  gridVersion,
  gridWidth,
  gridHeight,
  cellSize,
  showGridLines,
  theme,
  onCellPaint,
  onHoverCellChange,
  performanceMonitor,
}) {
  const { canvasRef, getContext, size } = useCanvas();
  const cameraRef = useRef({ zoom: 1, offsetX: 0, offsetY: 0 });
  const colorsRef = useRef({ surface: '#000', accent: '#0f0', border: '#333', accentSoft: '#0f04' });
  const paintStateRef = useRef(null); // { pointerId, value } while actively painting
  const panStateRef = useRef(null); // { pointerId, lastX, lastY } while actively panning
  const lastHoveredCellRef = useRef(null);

  const [hoverCell, setHoverCell] = useState(null);

  // Re-read theme colors from CSS custom properties only when the theme
  // actually changes, not on every draw call — getComputedStyle is not free.
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    colorsRef.current = {
      surface: styles.getPropertyValue('--surface').trim() || '#12151a',
      accent: styles.getPropertyValue('--accent').trim() || '#4fd1c5',
      border: styles.getPropertyValue('--border').trim() || '#2a2f3a',
      accentSoft: styles.getPropertyValue('--accent-soft').trim() || 'rgba(79, 209, 197, 0.35)',
    };
  }, [theme]);

  const draw = useCallback(() => {
    const context = getContext();
    if (!context || size.width === 0 || size.height === 0) return;

    const renderStart = performance.now();
    const grid = getGrid();
    const camera = cameraRef.current;
    const colors = colorsRef.current;
    const effectiveCellSize = cellSize * camera.zoom;

    context.fillStyle = colors.surface;
    context.fillRect(0, 0, size.width, size.height);

    const { startCol, endCol, startRow, endRow } = getVisibleCellRange(
      camera, cellSize, size.width, size.height, gridWidth, gridHeight
    );

    context.fillStyle = colors.accent;
    let visibleAliveCount = 0;
    let visibleCellCount = 0;

    for (let row = startRow; row < endRow; row++) {
      const rowOffset = row * gridWidth;
      const cellY = camera.offsetY + row * effectiveCellSize;

      for (let col = startCol; col < endCol; col++) {
        visibleCellCount++;
        if (grid[rowOffset + col]) {
          visibleAliveCount++;
          const cellX = camera.offsetX + col * effectiveCellSize;
          context.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
        }
      }
    }

    if (showGridLines && effectiveCellSize >= DRAW_GRID_LINES_MIN_CELL_PX) {
      context.strokeStyle = colors.border;
      context.lineWidth = 1;
      context.beginPath();

      for (let col = startCol; col <= endCol; col++) {
        const x = Math.round(camera.offsetX + col * effectiveCellSize) + 0.5;
        context.moveTo(x, camera.offsetY + startRow * effectiveCellSize);
        context.lineTo(x, camera.offsetY + endRow * effectiveCellSize);
      }
      for (let row = startRow; row <= endRow; row++) {
        const y = Math.round(camera.offsetY + row * effectiveCellSize) + 0.5;
        context.moveTo(camera.offsetX + startCol * effectiveCellSize, y);
        context.lineTo(camera.offsetX + endCol * effectiveCellSize, y);
      }
      context.stroke();
    }

    if (hoverCell && !paintStateRef.current) {
      context.strokeStyle = colors.accentSoft;
      context.lineWidth = 2;
      context.strokeRect(
        camera.offsetX + hoverCell.x * effectiveCellSize,
        camera.offsetY + hoverCell.y * effectiveCellSize,
        effectiveCellSize,
        effectiveCellSize
      );
    }

    if (performanceMonitor) {
      performanceMonitor.recordRenderTime(performance.now() - renderStart);
      performanceMonitor.recordCellsProcessed(visibleCellCount, visibleAliveCount);
      performanceMonitor.recordFrame();
    }
  }, [getContext, getGrid, size, cellSize, gridWidth, gridHeight, showGridLines, hoverCell, performanceMonitor]);

  // The draw loop runs continuously while mounted (independent of whether
  // the simulation itself is playing) so panning, zooming, and hover
  // feedback stay smooth even while paused.
  useAnimationLoop(draw, { isRunning: true, intervalMs: DRAW_LOOP_INTERVAL_MS });
  // gridVersion has no direct effect here — draw() reads getGrid() fresh
  // every tick, so a version bump is naturally picked up on the next frame.
  void gridVersion;

  const getCanvasRelativePosition = useCallback((event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, [canvasRef]);

  const updateHoverCell = useCallback((canvasX, canvasY) => {
    const cell = screenToGridCell(canvasX, canvasY, cameraRef.current, cellSize);
    const isInBounds = cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight;
    const nextHoverCell = isInBounds ? cell : null;

    const previous = lastHoveredCellRef.current;
    const changed = !previous || !nextHoverCell
      ? previous !== nextHoverCell
      : previous.x !== nextHoverCell.x || previous.y !== nextHoverCell.y;

    if (changed) {
      lastHoveredCellRef.current = nextHoverCell;
      setHoverCell(nextHoverCell);
      onHoverCellChange?.(nextHoverCell);
    }

    return nextHoverCell;
  }, [cellSize, gridWidth, gridHeight, onHoverCellChange]);

  const handlePointerDown = useCallback((event) => {
    const canvas = canvasRef.current;
    canvas.setPointerCapture(event.pointerId);
    const { x: canvasX, y: canvasY } = getCanvasRelativePosition(event);

    const isPanGesture = event.button === 1 || event.button === 2 || event.shiftKey;

    if (isPanGesture) {
      panStateRef.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
      return;
    }

    if (event.button !== 0) return;

    const cell = screenToGridCell(canvasX, canvasY, cameraRef.current, cellSize);
    if (cell.x < 0 || cell.x >= gridWidth || cell.y < 0 || cell.y >= gridHeight) return;

    const grid = getGrid();
    const nextValue = grid[cell.y * gridWidth + cell.x] ? 0 : 1;
    paintStateRef.current = { pointerId: event.pointerId, value: nextValue };
    onCellPaint?.(cell.x, cell.y, nextValue);
  }, [canvasRef, cellSize, gridWidth, gridHeight, getGrid, getCanvasRelativePosition, onCellPaint]);

  const handlePointerMove = useCallback((event) => {
    const { x: canvasX, y: canvasY } = getCanvasRelativePosition(event);
    updateHoverCell(canvasX, canvasY);

    const panState = panStateRef.current;
    if (panState && panState.pointerId === event.pointerId) {
      const deltaX = event.clientX - panState.lastX;
      const deltaY = event.clientY - panState.lastY;
      panState.lastX = event.clientX;
      panState.lastY = event.clientY;
      cameraRef.current = {
        ...cameraRef.current,
        offsetX: cameraRef.current.offsetX + deltaX,
        offsetY: cameraRef.current.offsetY + deltaY,
      };
      return;
    }

    const paintState = paintStateRef.current;
    if (paintState && paintState.pointerId === event.pointerId) {
      const cell = screenToGridCell(canvasX, canvasY, cameraRef.current, cellSize);
      if (cell.x < 0 || cell.x >= gridWidth || cell.y < 0 || cell.y >= gridHeight) return;
      onCellPaint?.(cell.x, cell.y, paintState.value);
    }
  }, [cellSize, gridWidth, gridHeight, getCanvasRelativePosition, updateHoverCell, onCellPaint]);

  const endInteraction = useCallback((event) => {
    if (paintStateRef.current?.pointerId === event.pointerId) paintStateRef.current = null;
    if (panStateRef.current?.pointerId === event.pointerId) panStateRef.current = null;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  }, [canvasRef]);

  const handlePointerLeave = useCallback(() => {
    lastHoveredCellRef.current = null;
    setHoverCell(null);
    onHoverCellChange?.(null);
  }, [onHoverCellChange]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const { x: canvasX, y: canvasY } = getCanvasRelativePosition(event);
    const camera = cameraRef.current;

    const zoomDelta = -Math.sign(event.deltaY) * CAMERA_LIMITS.zoomStep * camera.zoom;
    const nextZoom = clampZoom(camera.zoom + zoomDelta, CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom);
    const zoomRatio = nextZoom / camera.zoom;

    // Keep the point under the cursor fixed in place while zooming, rather
    // than always zooming toward the canvas origin.
    cameraRef.current = {
      zoom: nextZoom,
      offsetX: canvasX - (canvasX - camera.offsetX) * zoomRatio,
      offsetY: canvasY - (canvasY - camera.offsetY) * zoomRatio,
    };
  }, [getCanvasRelativePosition]);

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="simulation-canvas"
      role="img"
      aria-label={`Cellular automaton grid, ${gridWidth} by ${gridHeight} cells. Click and drag to draw. Shift-drag or middle-click to pan. Scroll to zoom.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      style={{ touchAction: 'none' }}
    />
  );
}

export default memo(SimulationCanvas);
