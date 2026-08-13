/**
 * Lightweight overlay shown only for operations expected to take longer
 * than ~200ms (large grid resize/randomize, loading a preset). The spinner
 * animation is disabled via CSS under prefers-reduced-motion; the label
 * itself is what conveys progress in that case.
 */
export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader-overlay" role="status" aria-live="polite">
      <div className="loader">
        <span className="loader__spinner" aria-hidden="true" />
        <span className="loader__label">{label}</span>
      </div>
    </div>
  );
}
