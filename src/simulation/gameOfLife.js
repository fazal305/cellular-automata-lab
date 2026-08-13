/**
 * Generic B/S (Birth/Survival) rule evaluator.
 *
 * Despite the filename, this function is not specific to Conway's rules —
 * it implements the general outer-totalistic evaluation shared by every
 * rule in rules.js. It's named after Game of Life because that's the
 * canonical/default automaton this app centers on, but HighLife, Seeds, and
 * Day & Night all reduce to the same birth/survival check.
 */
export function evolveCell(isAlive, liveNeighborCount, rule) {
  if (isAlive) {
    return rule.survival.includes(liveNeighborCount) ? 1 : 0;
  }
  return rule.birth.includes(liveNeighborCount) ? 1 : 0;
}
