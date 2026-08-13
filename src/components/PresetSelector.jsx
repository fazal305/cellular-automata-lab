import { PRESETS } from '../simulation/presets.js';

/**
 * One-click "quick start" scenarios (rule + grid size + bundled pattern).
 * Purely a dispatcher — selecting a preset hands the whole preset object to
 * `onSelectPreset`, and App.jsx decides how to apply it (resize grid, set
 * rule, stamp pattern, randomize). This component doesn't know how presets
 * get applied, only how to list them.
 */
export default function PresetSelector({ onSelectPreset }) {
  return (
    <section className="preset-selector" aria-label="Quick start presets">
      <h2 className="preset-selector__title">Quick Start</h2>
      <ul className="preset-selector__list">
        {PRESETS.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              className="preset-selector__item"
              onClick={() => onSelectPreset(preset)}
            >
              <span className="preset-selector__name">{preset.name}</span>
              <span className="preset-selector__description">{preset.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
