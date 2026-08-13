import { useEffect, useState } from 'react';
import GenerationDisplay from './GenerationDisplay.jsx';

function formatElapsedDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatPercentage(ratio) {
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * User-facing simulation statistics: population, grid, rule, speed, and
 * timing. `stats` and `generationTimeMs` are supplied by the parent (they
 * change naturally whenever `generation`/`gridVersion` changes, so they stay
 * fresh without this component doing its own computation).
 *
 * Elapsed time is the one value here that needs to advance even when
 * nothing else changes (e.g. the simulation is running slowly). Rather than
 * pushing a 1Hz ticker up into App and re-rendering the whole tree for it,
 * this component owns a small local interval that only re-renders itself.
 */
export default function StatisticsPanel({
  generation,
  stats,
  gridWidth,
  gridHeight,
  ruleName,
  speedLabel,
  getElapsedMs,
  generationTimeMs,
}) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => forceTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="statistics-panel" aria-label="Simulation statistics">
      <GenerationDisplay generation={generation} />

      <dl className="stat-list">
        <div className="stat-list__row">
          <dt>Alive Cells</dt>
          <dd>{stats.aliveCells.toLocaleString()}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Dead Cells</dt>
          <dd>{stats.deadCells.toLocaleString()}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Population</dt>
          <dd>{formatPercentage(stats.populationRatio)}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Grid Size</dt>
          <dd>{gridWidth} × {gridHeight}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Rule</dt>
          <dd>{ruleName}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Speed</dt>
          <dd>{speedLabel}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Elapsed Time</dt>
          <dd>{formatElapsedDuration(getElapsedMs())}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Generation Time</dt>
          <dd>{generationTimeMs.toFixed(2)} ms</dd>
        </div>
      </dl>
    </section>
  );
}
