import { Menu, Shield, UserCircle2, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ onOpenSidebar, onAddGoal }) {
  const { currentUser, isAdmin, switchRole } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-5 py-4 shadow-card">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-2 text-[var(--color-text)] min-[900px]:hidden"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-xl font-semibold text-[var(--color-text)]">Goal Management</h1>
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        <p className="hidden text-sm text-[var(--color-text-muted)] sm:block">
          Logged in as <strong className="font-semibold text-[var(--color-text)]">{currentUser.name}</strong>
        </p>
        {isAdmin && onAddGoal ? (
          <button
            type="button"
            onClick={onAddGoal}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(37,99,235,0.12)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            <Plus className="h-4 w-4" />
            + Add Goal
          </button>
        ) : null}
        <button
          type="button"
          onClick={switchRole}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          title="Toggle demo role"
        >
          {isAdmin ? <Shield className="h-4 w-4 text-[var(--color-primary)]" /> : <UserCircle2 className="h-4 w-4 text-[var(--color-muted)]" />}
          <span className="hidden sm:inline">{isAdmin ? 'Admin view' : 'User view'}</span>
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm lg:flex">
          <UserCircle2 className="h-5 w-5 text-[var(--color-text-muted)]" />
          <span className="font-semibold text-[var(--color-text)]">{currentUser.role}</span>
        </div>
      </div>
    </header>
  );
}
