import { KEYBOARD_SHORTCUTS } from '../config/constants.js';

/**
 * Contextual readout for whatever's under the cursor, plus a reference list
 * of keyboard shortcuts. Reads cell state on demand from `getGrid` rather
 * than holding its own copy — `hoveredCell` already changes only when the
 * hovered grid cell actually changes (SimulationCanvas dedupes that), so
 * this stays cheap.
 */
export default function InspectorPanel({ hoveredCell, getGrid, gridWidth }) {
  const isHoveringCell = hoveredCell !== null;
  const isAlive = isHoveringCell ? Boolean(getGrid()[hoveredCell.y * gridWidth + hoveredCell.x]) : false;

  return (
    <section className="inspector-panel" aria-label="Inspector">
      <div className="inspector-panel__cell-info">
        <h2 className="inspector-panel__title">Cell Inspector</h2>
        {isHoveringCell ? (
          <dl className="stat-list">
            <div className="stat-list__row">
              <dt>Coordinates</dt>
              <dd>({hoveredCell.x}, {hoveredCell.y})</dd>
            </div>
            <div className="stat-list__row">
              <dt>State</dt>
              <dd>{isAlive ? 'Alive' : 'Dead'}</dd>
            </div>
          </dl>
        ) : (
          <p className="inspector-panel__hint">Hover the grid to inspect a cell.</p>
        )}
      </div>

      <div className="inspector-panel__shortcuts">
        <h2 className="inspector-panel__title">Keyboard Shortcuts</h2>
        <dl className="stat-list">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div className="stat-list__row" key={`${shortcut.action}-${shortcut.key}`}>
              <dt>
                <kbd>{shortcut.label}</kbd>
              </dt>
              <dd>{shortcut.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
