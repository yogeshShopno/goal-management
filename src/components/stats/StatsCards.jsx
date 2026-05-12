import { useMemo } from 'react';
import { calcGoalProgress } from '../../utils/progressCalculator';
import { getDeadlineStatus } from '../../utils/deadlineUtils';
import { DEADLINE_STATUS } from '../../constants';

function TopCard({ value, label }) {
  return (
    <div className="min-w-[140px] flex-1 rounded-[10px] bg-[var(--color-card)] p-3.5 shadow-card">
      <strong className="block text-lg font-semibold text-[var(--color-text)]">{value}</strong>
      <small className="text-xs text-[var(--color-text-muted)]">{label}</small>
    </div>
  );
}

export default function StatsCards({ goals, actions, tasks }) {
  const metrics = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => calcGoalProgress(g, actions, tasks) === 100).length;
    const inProgress = goals.filter((g) => {
      const p = calcGoalProgress(g, actions, tasks);
      return p > 0 && p < 100;
    }).length;
    const overdue = goals.filter((g) => {
      const p = calcGoalProgress(g, actions, tasks);
      return getDeadlineStatus(g.deadline) === DEADLINE_STATUS.OVERDUE && p < 100;
    }).length;

    return { total, inProgress, completed, overdue };
  }, [goals, actions, tasks]);

  return (
    <div className="flex w-full flex-wrap gap-3">
      <TopCard value={metrics.total} label="Total Goals" />
      <TopCard value={metrics.inProgress} label="In Progress" />
      <TopCard value={metrics.completed} label="Completed Goals" />
      <TopCard value={metrics.overdue} label="Overdue Goals" />
    </div>
  );
}
