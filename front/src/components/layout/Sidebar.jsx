import { useMemo, useState } from 'react';
import { Search, FolderOpen, Layers, ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { calcGoalProgress } from '../../utils/progressCalculator';
import { getDeadlineStatus } from '../../utils/deadlineUtils';
import { DEADLINE_STATUS, SORT_OPTIONS } from '../../constants';
import GoalList from '../goals/GoalList';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Done' },
];

const SORT_LABELS = {
  deadline: 'By Deadline',
  priority: 'By Priority',
  progress: 'By Progress',
  recently_updated: 'By Updated',
};

function matchesTab(goal, tab, actions, tasks) {
  const progress = calcGoalProgress(goal, actions, tasks);
  const overdue = getDeadlineStatus(goal.deadline) === DEADLINE_STATUS.OVERDUE && progress < 100;
  switch (tab) {
    case 'active':
      return (
        (goal.status === 'in_progress' ||
          goal.status === 'not_started' ||
          goal.status === 'on_hold') &&
        progress < 100
      );
    case 'overdue':
      return overdue;
    case 'completed':
      return progress === 100;
    default:
      return true;
  }
}

export default function Sidebar({ goals, selectedGoalId, onSelectGoal }) {
  const { state, setSort } = useAppContext();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return goals
      .filter((g) => matchesTab(g, tab, state.actions, state.tasks))
      .filter((g) => !qq || g.name.toLowerCase().includes(qq));
  }, [goals, q, tab, state.actions, state.tasks]);

  return (
    <div className="flex h-full min-h-0 flex-col min-[1024px]:max-h-[calc(100vh-12rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[var(--color-primary)]">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-text)]">
            Workspace
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
          {goals.length}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-[var(--color-primary)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search goals..."
            className="w-full rounded-xl border border-[var(--color-border)] bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none"
          />
        </div>

        <div className="relative group">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={state.sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-all focus:border-[var(--color-primary)] focus:bg-white outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s] || s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex gap-1 p-1 bg-slate-100/50 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 px-2 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === t.id
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {visible.length > 0 ? (
          <GoalList goals={visible} selectedGoalId={selectedGoalId} onSelect={onSelectGoal} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
              <FolderOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">No goals found</p>
          </div>
        )}
      </div>
    </div>
  );
}


