/**
 * Small, prominent readout of the current generation count. Split out from
 * StatisticsPanel because it's meant to be glanceable at a larger size
 * (e.g. rendered near the canvas or in the header), not buried in a list of
 * secondary stats.
 */
export default function GenerationDisplay({ generation }) {
  return (
    <div className="generation-display" role="status" aria-live="polite" aria-atomic="true">
      <span className="generation-display__label">Generation</span>
      <span className="generation-display__value">{generation.toLocaleString()}</span>
    </div>
  );
}
