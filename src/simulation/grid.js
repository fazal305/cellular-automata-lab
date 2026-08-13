/**
 * Grid representation and low-level cell access.
 *
 * The grid is stored as a flat Uint8Array rather than a 2D array of objects.
 * For a 200x200 grid that's 40,000 bytes total (1 byte per cell) instead of
 * 40,000 individual JS objects/booleans with their own allocation and GC
 * overhead. Flat typed arrays are also contiguous in memory, which makes
 * scanning neighbors and copying whole generations fast — both are hot paths
 * that run every animation frame.
 *
 * Cell values are 0 (dead) or 1 (alive). Coordinates are converted to a
 * single index via `getIndex`, using row-major order: index = y * width + x.
 */

export function createGrid(width, height) {
  return new Uint8Array(width * height);
}

export function cloneGrid(grid) {
  return new Uint8Array(grid);
}

export function getIndex(width, x, y) {
  return y * width + x;
}

export function isInBounds(width, height, x, y) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function getCell(grid, width, x, y) {
  return grid[getIndex(width, x, y)];
}

export function setCell(grid, width, x, y, value) {
  grid[getIndex(width, x, y)] = value ? 1 : 0;
}

export function toggleCell(grid, width, x, y) {
  const index = getIndex(width, x, y);
  grid[index] = grid[index] ? 0 : 1;
}

export function clearGrid(grid) {
  grid.fill(0);
}

/**
 * Fills the grid with random live/dead cells.
 * @param {number} density - probability (0-1) that a given cell is alive.
 * @param {() => number} randomFn - defaults to Math.random; injectable for testing.
 */
export function randomizeGrid(grid, density = 0.3, randomFn = Math.random) {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = randomFn() < density ? 1 : 0;
  }
}

export function countAliveCells(grid) {
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    count += grid[i];
  }
  return count;
}

/**
 * Produces a new grid at the target dimensions, preserving the overlapping
 * region of the source grid (anchored at the top-left corner). Cells outside
 * the old bounds are dead.
 */
export function resizeGrid(grid, oldWidth, oldHeight, newWidth, newHeight) {
  const resized = createGrid(newWidth, newHeight);
  const copyWidth = Math.min(oldWidth, newWidth);
  const copyHeight = Math.min(oldHeight, newHeight);

  for (let y = 0; y < copyHeight; y++) {
    for (let x = 0; x < copyWidth; x++) {
      resized[getIndex(newWidth, x, y)] = grid[getIndex(oldWidth, x, y)];
    }
  }

  return resized;
}

/**
 * Stamps a pattern (2D array of 0/1 rows) onto a grid at the given origin.
 * Cells that would land outside the grid bounds are silently skipped.
 */
export function stampPattern(grid, width, height, pattern, originX, originY) {
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      const x = originX + col;
      const y = originY + row;
      if (isInBounds(width, height, x, y)) {
        setCell(grid, width, x, y, pattern[row][col]);
      }
    }
  }
}
