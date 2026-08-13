/**
 * Moore neighborhood counting (the 8 cells surrounding a given cell).
 *
 * This is the single most frequently executed piece of code in the app —
 * it runs width * height * 8 times per generation. It is written as a plain
 * unrolled loop over typed-array indices rather than allocating arrays of
 * neighbor coordinates, to avoid garbage collection pressure at 30-60
 * generations per second on large grids.
 */

const NEIGHBOR_OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],            [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];

/**
 * Counts live neighbors around (x, y).
 * @param {boolean} wrapEdges - if true, the grid wraps toroidally (edges
 *   connect to the opposite side). If false, cells off the edge count as dead.
 */
export function countAliveNeighbors(grid, width, height, x, y, wrapEdges) {
  let count = 0;

  for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
    let neighborX = x + NEIGHBOR_OFFSETS[i][0];
    let neighborY = y + NEIGHBOR_OFFSETS[i][1];

    if (wrapEdges) {
      neighborX = (neighborX + width) % width;
      neighborY = (neighborY + height) % height;
    } else if (
      neighborX < 0 || neighborX >= width ||
      neighborY < 0 || neighborY >= height
    ) {
      continue;
    }

    count += grid[neighborY * width + neighborX];
  }

  return count;
}
