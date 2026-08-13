/**
 * Centralized, data-driven configuration.
 *
 * Values that would otherwise be hardcoded inline across multiple
 * components (speed numbers, grid limits, keyboard bindings, storage keys)
 * live here instead, so changing a limit or adding a speed tier means
 * editing one file rather than hunting through JSX.
 */

export const GRID_LIMITS = {
  minWidth: 10,
  maxWidth: 400,
  minHeight: 10,
  maxHeight: 300,
  minCellSize: 2,
  maxCellSize: 40,
  defaultWidth: 80,
  defaultHeight: 50,
  defaultCellSize: 12,
};

export const SPEED_PRESETS = [
  { id: 'very-slow', label: 'Very Slow', generationsPerSecond: 1 },
  { id: 'slow', label: 'Slow', generationsPerSecond: 4 },
  { id: 'normal', label: 'Normal', generationsPerSecond: 10 },
  { id: 'fast', label: 'Fast', generationsPerSecond: 24 },
  { id: 'very-fast', label: 'Very Fast', generationsPerSecond: 60 },
];

export const DEFAULT_SPEED_ID = 'normal';
export const MIN_GENERATIONS_PER_SECOND = 1;
export const MAX_GENERATIONS_PER_SECOND = 60;

export const STORAGE_KEYS = {
  PREFERENCES: 'cellular-automata-lab:preferences',
  CUSTOM_PATTERNS: 'cellular-automata-lab:custom-patterns',
};

/**
 * Keyboard shortcut map. `action` values are the keys a consumer's handler
 * map (passed to useKeyboardShortcuts) must implement.
 */
export const KEYBOARD_SHORTCUTS = [
  { key: ' ', label: 'Space', action: 'toggleRunning', description: 'Play / Pause' },
  { key: 'n', label: 'N', action: 'step', description: 'Next generation' },
  { key: 's', label: 'S', action: 'step', description: 'Step' },
  { key: 'r', label: 'R', action: 'randomize', description: 'Randomize grid' },
  { key: 'c', label: 'C', action: 'clear', description: 'Clear grid' },
  { key: 'Escape', label: 'Esc', action: 'closePanels', description: 'Close panels / modals' },
];

export const DEFAULT_RANDOMIZE_DENSITY = 0.3;

export const CAMERA_LIMITS = {
  minZoom: 0.25,
  maxZoom: 6,
  zoomStep: 0.1,
};

export const DRAW_GRID_LINES_MIN_CELL_PX = 5;
