import { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { calcGoalProgress } from '../../utils/progressCalculator';
import { format, parseISO } from 'date-fns';

function formatDeadline(deadline) {
  if (!deadline) return '—';
  try {
    return format(parseISO(deadline), 'yyyy-MM-dd');
  } catch {
    return deadline;
  }
}

export default function GoalItem({ goal, active, onSelect }) {
  const { state } = useAppContext();
  const progress = useMemo(
    () => calcGoalProgress(goal, state.actions, state.tasks),
    [goal, state.actions, state.tasks]
  );
  const actionCount = useMemo(
    () => state.actions.filter((a) => a.goalId === goal.id).length,
    [goal.id, state.actions]
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(goal.id)}
      className={`w-full cursor-pointer rounded-lg border px-2.5 py-2.5 text-left transition-colors ${
        active
          ? 'border-[rgba(37,99,235,0.12)] bg-gradient-to-r from-[rgba(37,99,235,0.03)] to-transparent'
          : 'border-transparent hover:bg-[var(--color-bg)]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold text-[var(--color-text)]">{goal.name}</div>
          <div className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
            Due: {formatDeadline(goal.deadline)} • {actionCount} actions
          </div>
        </div>
        <div className="shrink-0 rounded-pill bg-[#eef2ff] px-2 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {progress}%
        </div>
      </div>
    </button>
  );
}
