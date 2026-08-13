import { useRef, useState } from 'react';
import PatternCard from './PatternCard.jsx';
import { DEFAULT_PATTERNS } from '../data/defaultPatterns.js';

/**
 * Browsable library of bundled patterns plus any patterns the user has
 * saved from their own grid, plus JSON import/export/copy for the current
 * grid. Saving/exporting reads whatever is currently on the canvas (via
 * callbacks wired to useSimulation's grid in App.jsx) rather than this
 * component tracking grid state itself.
 */
export default function PatternLibrary({
  customPatterns,
  onPlacePattern,
  onDeleteCustomPattern,
  onSaveCurrentAsPattern,
  onExportGrid,
  onCopyGridData,
  onImportPatternFile,
  importError,
  onDismissImportError,
}) {
  const [newPatternName, setNewPatternName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const fileInputRef = useRef(null);

  const handleSave = (event) => {
    event.preventDefault();
    const trimmedName = newPatternName.trim();
    if (!trimmedName) return;
    onSaveCurrentAsPattern(trimmedName);
    setNewPatternName('');
  };

  const handleCopyClick = async () => {
    const succeeded = await onCopyGridData();
    setCopyFeedback(succeeded ? 'Copied!' : 'Copy failed');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onImportPatternFile(file);
    event.target.value = '';
  };

  return (
    <section className="pattern-library" aria-label="Pattern library">
      <form className="pattern-library__save-form" onSubmit={handleSave}>
        <label htmlFor="pattern-name-input" className="control-label">
          Save current grid as pattern
        </label>
        <div className="pattern-library__save-row">
          <input
            id="pattern-name-input"
            type="text"
            value={newPatternName}
            onChange={(event) => setNewPatternName(event.target.value)}
            placeholder="Pattern name"
            maxLength={40}
          />
          <button type="submit" className="button button--small" disabled={!newPatternName.trim()}>
            Save
          </button>
        </div>
      </form>

      <div className="pattern-library__io">
        <button type="button" className="button button--small" onClick={onExportGrid}>
          Export Grid JSON
        </button>
        <button type="button" className="button button--small" onClick={handleCopyClick}>
          {copyFeedback || 'Copy Pattern Data'}
        </button>
        <button type="button" className="button button--small" onClick={() => fileInputRef.current?.click()}>
          Import Pattern JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {importError && (
        <div className="pattern-library__error" role="alert">
          <span>{importError}</span>
          <button type="button" className="icon-button" onClick={onDismissImportError} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      <div className="pattern-library__section">
        <h2 className="pattern-library__section-title">Built-in Patterns</h2>
        <div className="pattern-library__grid">
          {DEFAULT_PATTERNS.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} onPlace={onPlacePattern} />
          ))}
        </div>
      </div>

      {customPatterns.length > 0 && (
        <div className="pattern-library__section">
          <h2 className="pattern-library__section-title">Custom Patterns</h2>
          <div className="pattern-library__grid">
            {customPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onPlace={onPlacePattern}
                onDelete={onDeleteCustomPattern}
                isCustom
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
