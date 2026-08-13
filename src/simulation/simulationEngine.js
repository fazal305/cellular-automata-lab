import { createGrid, countAliveCells } from './grid.js';
import { countAliveNeighbors } from './neighborCounter.js';
import { evolveCell } from './gameOfLife.js';

/**
 * Advances a grid by exactly one generation.
 *
 * This is the sole entry point the rest of the app should use to step the
 * simulation — it is a pure function: given the same grid, dimensions, rule,
 * and options, it always produces the same next grid. It has no knowledge of
 * React, timers, or rendering, which keeps it independently testable and
 * reusable (e.g. from a future Web Worker) without touching the UI layer.
 *
 * @param {Uint8Array} grid - current generation, row-major flat array.
 * @param {number} width
 * @param {number} height
 * @param {object} rule - a rule from rules.js ({ birth, survival }).
 * @param {{ wrapEdges?: boolean }} [options]
 * @returns {Uint8Array} the next generation. Always a new array — the input
 *   grid is never mutated, so callers can safely diff or retain references
 *   to previous generations.
 */
export function simulateGeneration(grid, width, height, rule, options = {}) {
  const { wrapEdges = false } = options;
  const nextGrid = createGrid(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const liveNeighbors = countAliveNeighbors(grid, width, height, x, y, wrapEdges);
      nextGrid[index] = evolveCell(grid[index], liveNeighbors, rule);
    }
  }

  return nextGrid;
}

/**
 * Computes summary statistics for a grid. Kept separate from
 * simulateGeneration so callers that only need stats (e.g. after loading a
 * pattern, without stepping) don't pay for a full generation computation.
 */
export function computeGridStats(grid, width, height) {
  const aliveCells = countAliveCells(grid);
  const totalCells = width * height;

  return {
    aliveCells,
    deadCells: totalCells - aliveCells,
    totalCells,
    populationRatio: totalCells === 0 ? 0 : aliveCells / totalCells,
  };
}
