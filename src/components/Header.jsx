/**
 * Top bar: app title, mobile sidebar toggle, run status, live FPS, and
 * theme switch. Purely presentational — all values and handlers are owned
 * by App.jsx (via useSimulation / usePerformanceMonitor / theme state).
 */
export default function Header({
  isRunning,
  fps,
  theme,
  onToggleTheme,
  onToggleSidebar,
  isSidebarOpen,
}) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="icon-button app-header__menu-toggle"
          onClick={onToggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <h1 className="app-header__title">Cellular Automata Lab</h1>
      </div>

      <div className="app-header__right">
        <span
          className={`status-indicator ${isRunning ? 'status-indicator--running' : 'status-indicator--paused'}`}
        >
          <span className="status-indicator__dot" aria-hidden="true" />
          {isRunning ? 'Running' : 'Paused'}
        </span>

        <span className="app-header__fps" aria-label={`${fps} frames per second`}>
          {fps} FPS
        </span>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
      </div>
    </header>
  );
}
