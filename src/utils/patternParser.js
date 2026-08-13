import { GRID_LIMITS } from '../config/constants.js';

/**
 * Parses and validates a pattern from raw JSON text (e.g. an imported
 * file). Returns a result object rather than throwing, so the UI can show a
 * friendly error message for any malformed/unsupported input without a
 * try/catch at every call site.
 */
export function parsePatternJson(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return { success: false, error: 'That file is not valid JSON.' };
  }

  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Pattern data must be a JSON object.' };
  }

  const { name, width, height, cells } = data;

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { success: false, error: 'Pattern is missing valid integer "width"/"height" fields.' };
  }

  if (width < 1 || height < 1 || width > GRID_LIMITS.maxWidth || height > GRID_LIMITS.maxHeight) {
    return { success: false, error: `Pattern dimensions must be between 1 and ${GRID_LIMITS.maxWidth}x${GRID_LIMITS.maxHeight}.` };
  }

  if (!Array.isArray(cells) || cells.length !== height) {
    return { success: false, error: `"cells" must be an array of ${height} rows.` };
  }

  for (const row of cells) {
    if (!Array.isArray(row) || row.length !== width) {
      return { success: false, error: `Every row in "cells" must have exactly ${width} values.` };
    }
    if (!row.every((value) => value === 0 || value === 1)) {
      return { success: false, error: 'Cell values must be 0 or 1.' };
    }
  }

  return {
    success: true,
    pattern: {
      id: `imported-${Date.now()}`,
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Imported Pattern',
      category: 'custom',
      description: 'Imported pattern.',
      width,
      height,
      cells,
    },
  };
}
