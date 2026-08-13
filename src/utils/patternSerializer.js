/**
 * Converts an in-memory pattern (or a live grid) into the JSON shape used
 * for export/copy. Kept separate from patternParser.js (the reverse
 * direction) so serialize/parse can be tested and reasoned about
 * independently.
 */
export function serializePattern(pattern, ruleId) {
  return JSON.stringify(
    {
      name: pattern.name,
      rule: ruleId,
      width: pattern.width,
      height: pattern.height,
      cells: pattern.cells,
    },
    null,
    2
  );
}

export function gridToPattern(grid, width, height, name) {
  const cells = [];
  for (let row = 0; row < height; row++) {
    const cellRow = [];
    for (let col = 0; col < width; col++) {
      cellRow.push(grid[row * width + col]);
    }
    cells.push(cellRow);
  }
  return { id: `export-${Date.now()}`, name, category: 'custom', width, height, cells };
}
