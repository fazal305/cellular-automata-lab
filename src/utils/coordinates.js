/**
 * Conversions between canvas pixel space and grid cell space, accounting for
 * the current camera (pan offset + zoom). Pure math, no DOM/canvas access,
 * so it's usable both from draw code and from pointer-event handlers.
 */

export function screenToGridCell(canvasX, canvasY, camera, cellSize) {
  const effectiveCellSize = cellSize * camera.zoom;
  return {
    x: Math.floor((canvasX - camera.offsetX) / effectiveCellSize),
    y: Math.floor((canvasY - camera.offsetY) / effectiveCellSize),
  };
}

/**
 * Returns the range of grid columns/rows currently visible in the viewport,
 * clamped to the grid's actual bounds. Used to skip drawing (and counting)
 * cells that are panned or zoomed out of view — essential for keeping large
 * grids fast when zoomed in, since only a fraction of cells are ever
 * actually on screen at once.
 */
export function getVisibleCellRange(camera, cellSize, viewportWidth, viewportHeight, gridWidth, gridHeight) {
  const effectiveCellSize = cellSize * camera.zoom;

  const startCol = Math.max(0, Math.floor(-camera.offsetX / effectiveCellSize));
  const endCol = Math.min(gridWidth, Math.ceil((viewportWidth - camera.offsetX) / effectiveCellSize));
  const startRow = Math.max(0, Math.floor(-camera.offsetY / effectiveCellSize));
  const endRow = Math.min(gridHeight, Math.ceil((viewportHeight - camera.offsetY) / effectiveCellSize));

  return { startCol, endCol, startRow, endRow };
}

export function clampZoom(zoom, minZoom, maxZoom) {
  return Math.min(Math.max(zoom, minZoom), maxZoom);
}
