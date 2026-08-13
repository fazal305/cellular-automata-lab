/**
 * Bundled pattern library. Each entry is a self-contained pattern: a name,
 * its bounding-box dimensions, and a 2D array of 0/1 rows describing which
 * cells start alive. No external pattern files or URLs are used — everything
 * here is defined directly in code and shipped with the app.
 *
 * `buildCellsFromCoordinates` is used for the two more intricate patterns
 * (Pulsar, Gosper Glider Gun) instead of hand-typed ASCII art grids: a list
 * of (x, y) coordinates is far less error-prone to review and verify than
 * counting dots and hashes across dozens of characters per row.
 */

function buildCellsFromCoordinates(width, height, liveCellCoordinates) {
  const rows = Array.from({ length: height }, () => new Array(width).fill(0));
  for (const [x, y] of liveCellCoordinates) {
    rows[y][x] = 1;
  }
  return rows;
}

export const DEFAULT_PATTERNS = [
  {
    id: 'glider',
    name: 'Glider',
    category: 'spaceship',
    description: 'The smallest spaceship: translates diagonally by one cell every 4 generations.',
    width: 3,
    height: 3,
    cells: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  {
    id: 'blinker',
    name: 'Blinker',
    category: 'oscillator',
    description: 'The simplest oscillator: alternates between horizontal and vertical every generation.',
    width: 3,
    height: 1,
    cells: [
      [1, 1, 1],
    ],
  },
  {
    id: 'block',
    name: 'Block',
    category: 'still-life',
    description: 'The most common still life: a stable 2x2 square that never changes.',
    width: 2,
    height: 2,
    cells: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'beacon',
    name: 'Beacon',
    category: 'oscillator',
    description: 'A period-2 oscillator made of two diagonally touching blocks.',
    width: 4,
    height: 4,
    cells: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
  },
  {
    id: 'pulsar',
    name: 'Pulsar',
    category: 'oscillator',
    description: 'A large, symmetric period-3 oscillator — one of the most iconic Life patterns.',
    width: 13,
    height: 13,
    cells: buildCellsFromCoordinates(13, 13, [
      // Four "3-gap-3" arms, top and bottom.
      [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
      [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
      [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
      [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
      // Four sets of vertical tick marks, left and right of center.
      [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
      [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
      [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
      [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10],
    ]),
  },
  {
    id: 'lightweight-spaceship',
    name: 'Lightweight Spaceship',
    category: 'spaceship',
    description: 'A period-4 spaceship that travels horizontally, faster than the Glider.',
    width: 5,
    height: 4,
    cells: [
      [0, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 1],
      [1, 0, 0, 1, 0],
    ],
  },
  {
    id: 'gosper-glider-gun',
    name: 'Gosper Glider Gun',
    category: 'gun',
    description: 'The first known pattern to grow indefinitely, emitting a new Glider every 30 generations.',
    width: 36,
    height: 9,
    cells: buildCellsFromCoordinates(36, 9, [
      [0, 4], [0, 5], [1, 4], [1, 5],
      [10, 4], [10, 5], [10, 6],
      [11, 3], [11, 7],
      [12, 2], [12, 8],
      [13, 2], [13, 8],
      [14, 5],
      [15, 3], [15, 7],
      [16, 4], [16, 5], [16, 6],
      [17, 5],
      [20, 2], [20, 3], [20, 4],
      [21, 2], [21, 3], [21, 4],
      [22, 1], [22, 5],
      [24, 0], [24, 1], [24, 5], [24, 6],
      [34, 2], [34, 3],
      [35, 2], [35, 3],
    ]),
  },
];

export function getDefaultPatternById(patternId) {
  return DEFAULT_PATTERNS.find((pattern) => pattern.id === patternId);
}
