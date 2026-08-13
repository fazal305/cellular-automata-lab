/**
 * Curated "quick start" scenarios: a rule + grid configuration + which
 * bundled pattern (if any) to stamp down. Distinct from data/defaultPatterns.js,
 * which holds the actual pattern cell data — a preset references a pattern by
 * id rather than duplicating its cells, so there's exactly one copy of each
 * pattern's data in the app.
 */

export const PRESETS = [
  {
    id: 'glider-drift',
    name: 'Glider Drift',
    description: 'A single Glider drifting forever across a wrapped, toroidal grid.',
    ruleId: 'game-of-life',
    patternId: 'glider',
    gridWidth: 40,
    gridHeight: 40,
    wrapEdges: true,
  },
  {
    id: 'pulsar-oscillation',
    name: 'Pulsar Oscillation',
    description: 'A Pulsar centered on a modest grid, cycling every 3 generations.',
    ruleId: 'game-of-life',
    patternId: 'pulsar',
    gridWidth: 30,
    gridHeight: 30,
    wrapEdges: false,
  },
  {
    id: 'gosper-gun-stream',
    name: 'Glider Gun Stream',
    description: 'A Gosper Glider Gun on a wide grid, continuously emitting Gliders.',
    ruleId: 'game-of-life',
    patternId: 'gosper-glider-gun',
    gridWidth: 90,
    gridHeight: 50,
    wrapEdges: false,
  },
  {
    id: 'highlife-random-seed',
    name: 'HighLife Random Seed',
    description: 'A randomized HighLife starting condition on a wrapped grid.',
    ruleId: 'highlife',
    patternId: null,
    gridWidth: 60,
    gridHeight: 40,
    wrapEdges: true,
    randomizeOnLoad: true,
  },
];

export function getPresetById(presetId) {
  return PRESETS.find((preset) => preset.id === presetId);
}
