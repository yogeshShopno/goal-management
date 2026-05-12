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

export default function AppShell({ sidebar, children, onAddGoal, stats }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const desktopSidebar = cloneSidebar(sidebar, null);
  const mobileSidebar = cloneSidebar(sidebar, () => setDrawerOpen(false));

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header onOpenSidebar={() => setDrawerOpen(true)} onAddGoal={onAddGoal} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-7">
          {stats ? <div className="mb-3 flex flex-wrap gap-3">{stats}</div> : null}

          <div className="grid grid-cols-1 gap-[18px] min-[900px]:grid-cols-[360px_1fr]">
            <aside className="hidden h-fit min-[900px]:block">
              <div className="rounded-[10px] bg-[var(--color-card)] p-3.5 shadow-card">
                {desktopSidebar}
              </div>
            </aside>

            <aside
              className={`fixed top-16 bottom-0 left-0 z-40 flex w-[min(100%,18rem)] flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] transition-transform min-[900px]:hidden ${
                drawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
                <span className="text-sm font-semibold text-[var(--color-text)]">My Goals</span>
                <button
                  type="button"
                  className="text-sm font-medium text-[var(--color-primary)]"
                  onClick={() => setDrawerOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">{mobileSidebar}</div>
            </aside>

            {drawerOpen ? (
              <button
                type="button"
                aria-label="Close sidebar"
                className="fixed inset-0 top-16 z-30 bg-[var(--color-text)]/25 backdrop-blur-[1px] min-[900px]:hidden"
                onClick={() => setDrawerOpen(false)}
              />
            ) : null}

            <main className="relative z-10 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
