/**
 * Rule definitions for outer-totalistic cellular automata.
 *
 * Every rule here is expressed in standard B/S ("Birth/Survival") notation:
 * `birth` lists neighbor counts that bring a dead cell to life, `survival`
 * lists neighbor counts that keep a live cell alive. Conway's Game of Life,
 * HighLife, Seeds, and Day & Night are all members of this same rule family —
 * they differ only in which counts appear in each list. This is what lets a
 * single evaluator (see gameOfLife.js) drive all four without special-casing
 * any of them.
 *
 * New rules can be added by appending another entry here; nothing else in
 * the simulation engine needs to change.
 */

export const RULES = {
  'game-of-life': {
    id: 'game-of-life',
    name: "Conway's Game of Life",
    birth: [3],
    survival: [2, 3],
    description:
      'The original cellular automaton. A dead cell with exactly 3 live neighbors is born; a live cell survives with 2 or 3 live neighbors.',
  },
  highlife: {
    id: 'highlife',
    name: 'HighLife',
    birth: [3, 6],
    survival: [2, 3],
    description:
      'A Game of Life variant that also births cells with exactly 6 live neighbors, producing a self-replicating pattern not found in standard Life.',
  },
  seeds: {
    id: 'seeds',
    name: 'Seeds',
    birth: [2],
    survival: [],
    description:
      'An explosive, chaotic automaton where cells are born with exactly 2 neighbors and never survive — every live cell dies each generation.',
  },
  'day-and-night': {
    id: 'day-and-night',
    name: 'Day & Night',
    birth: [3, 6, 7, 8],
    survival: [3, 4, 6, 7, 8],
    description:
      'Symmetric under swapping live and dead cells, producing intricate, stable "living" regions alongside sprawling dead space.',
  },
};

export const DEFAULT_RULE_ID = 'game-of-life';

export function getRuleById(ruleId) {
  const rule = RULES[ruleId];
  if (!rule) {
    throw new Error(`Unknown rule id: "${ruleId}"`);
  }
  return rule;
}

export function listRules() {
  return Object.values(RULES);
}
