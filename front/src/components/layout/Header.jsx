import { Menu, UserCircle2, Plus, LogOut, Target } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ onOpenSidebar, onAddGoal }) {
  const { currentUser, isAdmin, logout } = useAuth();

  return (
    <header className="glass sticky top-0 z-50 flex shrink-0 items-center justify-between px-6 py-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] min-[900px]:hidden"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[#818cf8] text-white shadow-lg shadow-indigo-200">
            <Target className="h-6 w-6" />
          </div>
          <h1 className="hidden text-xl font-bold tracking-tight text-[var(--color-text)] sm:block">
            GoaL Management
          </h1>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        {isAdmin && onAddGoal && (
          <button
            type="button"
            onClick={onAddGoal}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Create Goal</span>
          </button>
        )}

        <div className="h-8 w-px bg-[var(--color-border)] mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-bold text-[var(--color-text)] leading-none">
              {currentUser.name}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              {currentUser.role}
            </span>
          </div>
          
          <div className="relative group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--color-border)] bg-white text-[var(--color-primary)] transition-all group-hover:border-[var(--color-primary)]">
              <UserCircle2 className="h-6 w-6" />
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-danger)] transition-all hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-light)] active:scale-95"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

