import { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import SimulationCanvas from './components/SimulationCanvas.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import RuleControls from './components/RuleControls.jsx';
import GridControls from './components/GridControls.jsx';
import StatisticsPanel from './components/StatisticsPanel.jsx';
import PerformancePanel from './components/PerformancePanel.jsx';
import PatternLibrary from './components/PatternLibrary.jsx';
import PresetSelector from './components/PresetSelector.jsx';
import InspectorPanel from './components/InspectorPanel.jsx';
import Loader from './components/Loader.jsx';

import { useSimulation } from './hooks/useSimulation.js';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';

import { listRules } from './simulation/rules.js';
import { getDefaultPatternById } from './data/defaultPatterns.js';
import { STORAGE_KEYS, GRID_LIMITS } from './config/constants.js';
import { serializePattern, gridToPattern } from './utils/patternSerializer.js';
import { parsePatternJson } from './utils/patternParser.js';

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  cellSize: GRID_LIMITS.defaultCellSize,
  showGridLines: true,
};

// Above this cell count, grid-rebuilding operations are deferred one paint
// so the loader can actually become visible before the synchronous work
// blocks the main thread. Below it, the work is imperceptibly fast and a
// loader would only flash.
const LARGE_OPERATION_CELL_THRESHOLD = 20000;

const MOBILE_BREAKPOINT_PX = 900;

function App() {
  const [preferences, setPreferences] = useLocalStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  const [customPatterns, setCustomPatterns] = useLocalStorage(STORAGE_KEYS.CUSTOM_PATTERNS, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX + 1}px)`).matches
  );
  const [hoveredCell, setHoveredCell] = useState(null);
  const [loaderLabel, setLoaderLabel] = useState(null);
  const [importError, setImportError] = useState(null);

  const simulation = useSimulation({
    initialWidth: GRID_LIMITS.defaultWidth,
    initialHeight: GRID_LIMITS.defaultHeight,
  });
  const performanceMonitor = usePerformanceMonitor();
  const rules = useMemo(() => listRules(), []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences.theme]);

  // Subscribes to future breakpoint crossings (the initial value above is
  // already read correctly via the lazy useState initializer, so this
  // effect only needs to react to *changes*, not set the value itself).
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX + 1}px)`);
    const handleChange = (event) => setIsSidebarOpen(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Feeds the generation-time metric into the performance monitor whenever
  // a step actually happens. lastStepDurationRef is written synchronously
  // just before the generation counter updates, so it's already current by
  // the time this effect runs.
  useEffect(() => {
    performanceMonitor.recordGenerationTime(simulation.lastStepDurationRef.current);
  }, [simulation.generation, simulation.lastStepDurationRef, performanceMonitor]);

  const runHeavyOperation = useCallback(async (label, work) => {
    setLoaderLabel(label);
    // Two rAFs guarantee a paint has actually occurred (the first schedules
    // it, the second confirms it landed) before the synchronous work below
    // blocks the main thread — otherwise the loader would never render.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    work();
    setLoaderLabel(null);
  }, []);

  const handleRandomize = useCallback(() => {
    const totalCells = simulation.width * simulation.height;
    if (totalCells > LARGE_OPERATION_CELL_THRESHOLD) {
      runHeavyOperation('Randomizing grid…', () => simulation.randomize());
    } else {
      simulation.randomize();
    }
  }, [simulation, runHeavyOperation]);

  const handleResize = useCallback((nextWidth, nextHeight) => {
    const totalCells = nextWidth * nextHeight;
    if (totalCells > LARGE_OPERATION_CELL_THRESHOLD) {
      runHeavyOperation('Resizing grid…', () => simulation.setGridSize(nextWidth, nextHeight));
    } else {
      simulation.setGridSize(nextWidth, nextHeight);
    }
  }, [simulation, runHeavyOperation]);

  const handlePlacePattern = useCallback((pattern) => {
    const originX = Math.floor((simulation.width - pattern.width) / 2);
    const originY = Math.floor((simulation.height - pattern.height) / 2);
    simulation.placePattern(pattern, originX, originY);
  }, [simulation]);

  const handleSelectPreset = useCallback((preset) => {
    const pattern = preset.patternId ? getDefaultPatternById(preset.patternId) : null;
    runHeavyOperation(`Loading ${preset.name}…`, () => {
      simulation.loadScenario({
        width: preset.gridWidth,
        height: preset.gridHeight,
        ruleId: preset.ruleId,
        wrapEdges: preset.wrapEdges,
        pattern,
        randomize: Boolean(preset.randomizeOnLoad),
      });
    });
  }, [simulation, runHeavyOperation]);

  const handleSaveCurrentAsPattern = useCallback((name) => {
    const grid = simulation.getGrid();
    const cells = [];
    for (let row = 0; row < simulation.height; row++) {
      const cellRow = [];
      for (let col = 0; col < simulation.width; col++) {
        cellRow.push(grid[row * simulation.width + col]);
      }
      cells.push(cellRow);
    }

    const newPattern = {
      id: `custom-${Date.now()}`,
      name,
      category: 'custom',
      description: 'User-saved pattern.',
      width: simulation.width,
      height: simulation.height,
      cells,
    };

    setCustomPatterns((current) => [...current, newPattern]);
  }, [simulation, setCustomPatterns]);

  const handleDeleteCustomPattern = useCallback((patternId) => {
    setCustomPatterns((current) => current.filter((pattern) => pattern.id !== patternId));
  }, [setCustomPatterns]);

  const handleExportGrid = useCallback(() => {
    try {
      const pattern = gridToPattern(simulation.getGrid(), simulation.width, simulation.height, 'Exported Grid');
      const json = serializePattern(pattern, simulation.ruleId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cellular-automata-lab-grid-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setImportError(`Export failed: ${error.message}`);
    }
  }, [simulation]);

  const handleCopyGridData = useCallback(async () => {
    try {
      const pattern = gridToPattern(simulation.getGrid(), simulation.width, simulation.height, 'Copied Grid');
      const json = serializePattern(pattern, simulation.ruleId);
      await navigator.clipboard.writeText(json);
      return true;
    } catch {
      return false;
    }
  }, [simulation]);

  const handleImportPatternFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = parsePatternJson(reader.result);
      if (result.success) {
        setCustomPatterns((current) => [...current, result.pattern]);
        setImportError(null);
      } else {
        setImportError(result.error);
      }
    };
    reader.onerror = () => setImportError('Could not read that file.');
    reader.readAsText(file);
  }, [setCustomPatterns]);

  const handleToggleTheme = useCallback(() => {
    setPreferences((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }));
  }, [setPreferences]);

  const handleCellSizeChange = useCallback((cellSize) => {
    setPreferences((current) => ({ ...current, cellSize }));
  }, [setPreferences]);

  const handleShowGridLinesChange = useCallback((showGridLines) => {
    setPreferences((current) => ({ ...current, showGridLines }));
  }, [setPreferences]);

  const keyboardHandlers = useMemo(() => ({
    toggleRunning: () => (simulation.isRunning ? simulation.stop() : simulation.start()),
    step: () => {
      if (!simulation.isRunning) simulation.step();
    },
    randomize: handleRandomize,
    clear: simulation.clear,
    closePanels: () => setIsSidebarOpen(false),
  }), [simulation, handleRandomize]);

  useKeyboardShortcuts(keyboardHandlers);

  const stats = useMemo(
    () => simulation.getStats(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [simulation.getStats, simulation.gridVersion]
  );

  const speedLabel = simulation.speedPresets.find((preset) => preset.id === simulation.speedId)?.label ?? '';

  return (
    <>
      {loaderLabel && <Loader label={loaderLabel} />}

      <AppShell
        isSidebarOpen={isSidebarOpen}
        header={
          <Header
            isRunning={simulation.isRunning}
            fps={performanceMonitor.stats.fps}
            theme={preferences.theme}
            onToggleTheme={handleToggleTheme}
            onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
            isSidebarOpen={isSidebarOpen}
          />
        }
        sidebar={
          <Sidebar isOpen={isSidebarOpen}>
            <RuleControls ruleId={simulation.ruleId} onRuleChange={simulation.setRuleId} rules={rules} />
            <GridControls
              width={simulation.width}
              height={simulation.height}
              onResize={handleResize}
              cellSize={preferences.cellSize}
              onCellSizeChange={handleCellSizeChange}
              wrapEdges={simulation.wrapEdges}
              onWrapEdgesChange={simulation.setWrapEdges}
              showGridLines={preferences.showGridLines}
              onShowGridLinesChange={handleShowGridLinesChange}
            />
            <PresetSelector onSelectPreset={handleSelectPreset} />
            <PatternLibrary
              customPatterns={customPatterns}
              onPlacePattern={handlePlacePattern}
              onDeleteCustomPattern={handleDeleteCustomPattern}
              onSaveCurrentAsPattern={handleSaveCurrentAsPattern}
              onExportGrid={handleExportGrid}
              onCopyGridData={handleCopyGridData}
              onImportPatternFile={handleImportPatternFile}
              importError={importError}
              onDismissImportError={() => setImportError(null)}
            />
          </Sidebar>
        }
        main={
          <SimulationCanvas
            getGrid={simulation.getGrid}
            gridVersion={simulation.gridVersion}
            gridWidth={simulation.width}
            gridHeight={simulation.height}
            cellSize={preferences.cellSize}
            showGridLines={preferences.showGridLines}
            theme={preferences.theme}
            onCellPaint={simulation.setCell}
            onHoverCellChange={setHoveredCell}
            performanceMonitor={performanceMonitor}
          />
        }
        statisticsPanel={
          <>
            <StatisticsPanel
              generation={simulation.generation}
              stats={stats}
              gridWidth={simulation.width}
              gridHeight={simulation.height}
              ruleName={simulation.rule.name}
              speedLabel={speedLabel}
              getElapsedMs={simulation.getElapsedMs}
              generationTimeMs={simulation.lastStepDurationRef.current}
            />
            <PerformancePanel
              stats={performanceMonitor.stats}
              gridWidth={simulation.width}
              gridHeight={simulation.height}
            />
            <InspectorPanel
              hoveredCell={hoveredCell}
              getGrid={simulation.getGrid}
              gridWidth={simulation.width}
            />
          </>
        }
        footer={
          <SimulationControls
            isRunning={simulation.isRunning}
            onStart={simulation.start}
            onStop={simulation.stop}
            onStep={simulation.step}
            onReset={simulation.reset}
            onRandomize={handleRandomize}
            onClear={simulation.clear}
            speedId={simulation.speedId}
            onSpeedChange={simulation.setSpeedId}
            speedPresets={simulation.speedPresets}
          />
        }
      />
    </>
  );
}

export default App;
