/**
 * Top-level layout scaffold. Defines the regions from the app's mockup
 * (header / sidebar / canvas / statistics / footer controls) as named
 * slots, and stays agnostic about what's rendered in each — App.jsx decides
 * that. Keeping layout structure separate from content keeps this component
 * stable even as individual panels change.
 */
export default function AppShell({ header, sidebar, main, statisticsPanel, footer }) {
  return (
    <div className="app-shell">
      {header}
      <div className="app-shell__body">
        {sidebar}
        <main className="app-shell__main" aria-label="Simulation canvas">
          {main}
        </main>
        <div className="app-shell__aside">{statisticsPanel}</div>
      </div>
      <footer className="app-shell__footer">{footer}</footer>
    </div>
  );
}
