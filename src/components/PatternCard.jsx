import { memo, useEffect, useRef } from 'react';

const PREVIEW_SIZE_PX = 72;

/**
 * A single pattern entry: a small static canvas preview plus name,
 * dimensions, and actions. The preview is drawn once (on mount or when the
 * pattern changes) rather than every frame — it's a static thumbnail, not a
 * live simulation.
 */
function PatternCard({ pattern, onPlace, onDelete, isCustom = false }) {
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = PREVIEW_SIZE_PX * devicePixelRatio;
    canvas.height = PREVIEW_SIZE_PX * devicePixelRatio;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const styles = getComputedStyle(document.documentElement);
    const surfaceColor = styles.getPropertyValue('--surface-elevated').trim() || '#1a1e26';
    const accentColor = styles.getPropertyValue('--accent').trim() || '#4fd1c5';

    context.fillStyle = surfaceColor;
    context.fillRect(0, 0, PREVIEW_SIZE_PX, PREVIEW_SIZE_PX);

    const cellSize = Math.min(PREVIEW_SIZE_PX / pattern.width, PREVIEW_SIZE_PX / pattern.height);
    const offsetX = (PREVIEW_SIZE_PX - pattern.width * cellSize) / 2;
    const offsetY = (PREVIEW_SIZE_PX - pattern.height * cellSize) / 2;

    context.fillStyle = accentColor;
    for (let row = 0; row < pattern.height; row++) {
      for (let col = 0; col < pattern.width; col++) {
        if (pattern.cells[row][col]) {
          context.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [pattern]);

  return (
    <article className="pattern-card">
      <canvas
        ref={previewCanvasRef}
        className="pattern-card__preview"
        role="img"
        aria-label={`Preview of ${pattern.name} pattern`}
        style={{ width: PREVIEW_SIZE_PX, height: PREVIEW_SIZE_PX }}
      />
      <div className="pattern-card__body">
        <h3 className="pattern-card__name">{pattern.name}</h3>
        <p className="pattern-card__dimensions">
          {pattern.width} × {pattern.height}
        </p>
        {pattern.description && <p className="pattern-card__description">{pattern.description}</p>}
      </div>
      <div className="pattern-card__actions">
        <button type="button" className="button button--small" onClick={() => onPlace(pattern)}>
          Place
        </button>
        {isCustom && onDelete && (
          <button
            type="button"
            className="button button--small button--danger"
            onClick={() => onDelete(pattern.id)}
            aria-label={`Delete custom pattern ${pattern.name}`}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(PatternCard);
