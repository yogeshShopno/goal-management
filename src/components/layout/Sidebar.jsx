import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { calcGoalProgress } from '../../utils/progressCalculator';
import { getDeadlineStatus } from '../../utils/deadlineUtils';
import { DEADLINE_STATUS } from '../../constants';
import GoalList from '../goals/GoalList';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
];

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
  const { state } = useAppContext();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return goals
      .filter((g) => matchesTab(g, tab, state.actions, state.tasks))
      .filter((g) => !qq || g.name.toLowerCase().includes(qq));
  }, [goals, q, tab, state.actions, state.tasks]);

  return (
    <div className="flex h-full min-h-0 flex-col min-[900px]:max-h-[calc(100vh-8rem)]">
      <h3 className="m-0 text-base font-semibold text-[var(--color-text)]">My Goals</h3>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--color-text-light)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search goals..."
          className="w-full rounded-md border border-[#e6edf3] bg-[var(--color-bg)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
              tab === t.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <GoalList goals={visible} selectedGoalId={selectedGoalId} onSelect={onSelectGoal} />
      </div>
    </div>
  );
}
