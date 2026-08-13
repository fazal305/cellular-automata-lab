import { KEYBOARD_SHORTCUTS } from '../config/constants.js';

function shortcutLabelFor(action) {
  return KEYBOARD_SHORTCUTS.find((entry) => entry.action === action)?.label ?? null;
}

/**
 * Play/Pause/Step/Reset/Randomize/Clear plus speed selection. All handlers
 * come from useSimulation via App.jsx — this component holds no simulation
 * state of its own.
 */
export default function SimulationControls({
  isRunning,
  onStart,
  onStop,
  onStep,
  onReset,
  onRandomize,
  onClear,
  speedId,
  onSpeedChange,
  speedPresets,
}) {
  const speedIndex = speedPresets.findIndex((preset) => preset.id === speedId);

  return (
    <section className="simulation-controls" aria-label="Simulation controls">
      <div className="simulation-controls__buttons">
        <button
          type="button"
          className="button button--primary"
          onClick={isRunning ? onStop : onStart}
          title={`${isRunning ? 'Pause' : 'Play'} (${shortcutLabelFor('toggleRunning')})`}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>

        <button
          type="button"
          className="button"
          onClick={onStep}
          disabled={isRunning}
          title={`Step forward one generation (${shortcutLabelFor('step')})`}
        >
          Step
        </button>

        <button type="button" className="button" onClick={onReset} title="Clear the grid and reset the generation counter">
          Reset
        </button>

        <button
          type="button"
          className="button"
          onClick={() => onRandomize()}
          title={`Fill the grid randomly (${shortcutLabelFor('randomize')})`}
        >
          Randomize
        </button>

        <button
          type="button"
          className="button button--danger"
          onClick={onClear}
          title={`Clear all cells (${shortcutLabelFor('clear')})`}
        >
          Clear
        </button>
      </div>

      <div className="simulation-controls__speed">
        <label htmlFor="speed-select" className="control-label">
          Speed
        </label>
        <select id="speed-select" value={speedId} onChange={(event) => onSpeedChange(event.target.value)}>
          {speedPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <input
          type="range"
          min={0}
          max={speedPresets.length - 1}
          step={1}
          value={speedIndex}
          onChange={(event) => onSpeedChange(speedPresets[Number(event.target.value)].id)}
          aria-label="Simulation speed"
        />
      </div>
    </section>
  );
}
