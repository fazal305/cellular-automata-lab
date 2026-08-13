/**
 * Left control panel container. On narrow viewports it collapses off-canvas
 * (toggled from Header); on desktop it stays open by default. It stays
 * mounted either way — collapsing is a CSS transform/visibility concern
 * handled in index.css, not a mount/unmount — so panel-internal state
 * (scroll position, form inputs) isn't lost when it's toggled shut.
 */
export default function Sidebar({ isOpen, children }) {
  return (
    <aside
      id="app-sidebar"
      className={`app-sidebar ${isOpen ? 'app-sidebar--open' : 'app-sidebar--collapsed'}`}
    >
      <div className="app-sidebar__content">{children}</div>
    </aside>
  );
}
