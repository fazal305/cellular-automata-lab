import { useState } from 'react';
import { GRID_LIMITS } from '../config/constants.js';

/**
 * Grid dimension, cell size, wrap-around, and grid-line visibility controls.
 *
 * Width/height use local draft state instead of calling onResize on every
 * keystroke: resizing rebuilds the grid (via useSimulation's setGridSize),
 * which is disruptive to do mid-keystroke. The draft commits on blur, Enter,
 * or the Apply button. Cell size / wrap / grid-lines are cheap flags with no
 * such cost, so those apply immediately.
 *
 * When width/height change from elsewhere (e.g. a preset resizing the
 * grid), the draft needs to follow along. Rather than an effect that calls
 * setState after commit, this re-syncs during render itself — React's
 * documented pattern for resetting derived state when a prop changes,
 * which avoids the extra render-then-effect-then-render cycle.
 */
export default function GridControls({
  width,
  height,
  onResize,
  cellSize,
  onCellSizeChange,
  wrapEdges,
  onWrapEdgesChange,
  showGridLines,
  onShowGridLinesChange,
}) {
  const [lastSyncedWidth, setLastSyncedWidth] = useState(width);
  const [lastSyncedHeight, setLastSyncedHeight] = useState(height);
  const [draftWidth, setDraftWidth] = useState(width);
  const [draftHeight, setDraftHeight] = useState(height);

  if (width !== lastSyncedWidth) {
    setLastSyncedWidth(width);
    setDraftWidth(width);
  }
  if (height !== lastSyncedHeight) {
    setLastSyncedHeight(height);
    setDraftHeight(height);
  }

  const applyResize = () => {
    onResize(Number(draftWidth), Number(draftHeight));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') applyResize();
  };

  return (
    <section className="control-panel" aria-label="Grid configuration">
      <div className="control-panel__row">
        <label htmlFor="grid-width" className="control-label">
          Width
        </label>
        <input
          id="grid-width"
          type="number"
          min={GRID_LIMITS.minWidth}
          max={GRID_LIMITS.maxWidth}
          value={draftWidth}
          onChange={(event) => setDraftWidth(event.target.value)}
          onBlur={applyResize}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="control-panel__row">
        <label htmlFor="grid-height" className="control-label">
          Height
        </label>
        <input
          id="grid-height"
          type="number"
          min={GRID_LIMITS.minHeight}
          max={GRID_LIMITS.maxHeight}
          value={draftHeight}
          onChange={(event) => setDraftHeight(event.target.value)}
          onBlur={applyResize}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button type="button" className="button" onClick={applyResize}>
        Apply Size
      </button>

      <div className="control-panel__row">
        <label htmlFor="cell-size" className="control-label">
          Cell Size ({cellSize}px)
        </label>
        <input
          id="cell-size"
          type="range"
          min={GRID_LIMITS.minCellSize}
          max={GRID_LIMITS.maxCellSize}
          value={cellSize}
          onChange={(event) => onCellSizeChange(Number(event.target.value))}
        />
      </div>

      <label className="control-panel__checkbox">
        <input
          type="checkbox"
          checked={wrapEdges}
          onChange={(event) => onWrapEdgesChange(event.target.checked)}
        />
        Wrap edges (toroidal grid)
      </label>

      <label className="control-panel__checkbox">
        <input
          type="checkbox"
          checked={showGridLines}
          onChange={(event) => onShowGridLinesChange(event.target.checked)}
        />
        Show grid lines
      </label>
    </section>
  );
}
