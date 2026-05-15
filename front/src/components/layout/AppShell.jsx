import { cloneElement, isValidElement, useState } from 'react';
import Header from './Header';

function cloneSidebar(sidebar, onSelect) {
  if (!isValidElement(sidebar)) return sidebar;
  return cloneElement(sidebar, {
    onSelectGoal: (id) => {
      sidebar.props.onSelectGoal?.(id);
      onSelect?.();
    },
  });
}

export default function AppShell({ sidebar, children, stats }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const desktopSidebar = cloneSidebar(sidebar, null);
  const mobileSidebar = cloneSidebar(sidebar, () => setDrawerOpen(false));

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header onOpenSidebar={() => setDrawerOpen(true)} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
          {stats ? <div className="mb-6 flex flex-wrap gap-4">{stats}</div> : null}

          <div className="grid grid-cols-1 gap-6 min-[1024px]:grid-cols-[320px_1fr]">
            <aside className="hidden h-fit min-[1024px]:block">
              <div className="rounded-[16px] bg-[var(--color-card)] p-4 shadow-card">
                {desktopSidebar}
              </div>
            </aside>

            <aside
              className={`fixed top-0 bottom-0 left-0 z-50 flex w-[280px] flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl transition-transform min-[1024px]:hidden ${
                drawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
                  <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-text)]">Workspace</span>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-[var(--color-primary)]"
                  onClick={() => setDrawerOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">{mobileSidebar}</div>
            </aside>

            {drawerOpen ? (
              <button
                type="button"
                aria-label="Close sidebar"
                className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity min-[1024px]:hidden"
                onClick={() => setDrawerOpen(false)}
              />
            ) : null}

            <main className="relative z-10 min-w-0 space-y-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
