/**
 * Developer-facing performance readout: FPS, generation compute time, canvas
 * render time, and cell counts. Sourced from usePerformanceMonitor's
 * `stats`, which is already throttled to ~2 updates/sec internally — this
 * component just displays whatever it's given, so it re-renders exactly as
 * often as that throttle allows, not on every frame.
 *
 * This panel exists specifically to make the Canvas-over-DOM tradeoff
 * visible: watch "Cells Rendered" and "Render Time" while resizing the grid
 * to see why a per-cell React component approach wouldn't hold up here.
 */
export default function PerformancePanel({ stats, gridWidth, gridHeight }) {
  return (
    <section className="performance-panel" aria-label="Performance monitor">
      <h2 className="performance-panel__title">Performance</h2>
      <dl className="stat-list">
        <div className="stat-list__row">
          <dt>FPS</dt>
          <dd>{stats.fps}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Generation Time</dt>
          <dd>{stats.generationTimeMs.toFixed(2)} ms</dd>
        </div>
        <div className="stat-list__row">
          <dt>Render Time</dt>
          <dd>{stats.renderTimeMs.toFixed(2)} ms</dd>
        </div>
        <div className="stat-list__row">
          <dt>Cells Rendered</dt>
          <dd>{stats.cellsProcessed.toLocaleString()}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Active Cells</dt>
          <dd>{stats.activeCells.toLocaleString()}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Grid Dimensions</dt>
          <dd>{gridWidth} × {gridHeight}</dd>
        </div>
      </dl>
    </section>
  );
}
