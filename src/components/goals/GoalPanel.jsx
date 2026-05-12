import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { useActions } from '../../hooks/useActions';
import { calcGoalProgress, calcActionProgress } from '../../utils/progressCalculator';
import { userDisplayName } from '../../utils/userDisplay';
import ActionList from '../actions/ActionList';
import ActionForm from '../actions/ActionForm';
import GoalForm from './GoalForm';
import ConfirmDialog from '../common/ConfirmDialog';
import ProgressBar from '../common/ProgressBar';
import GoalBadge from './GoalBadge';

function formatDeadline(deadline) {
  if (!deadline) return '—';
  try {
    return format(parseISO(deadline), 'yyyy-MM-dd');
  } catch {
    return deadline;
  }
}

export default function GoalPanel({ goal }) {
  const { state, editGoal, removeGoal } = useAppContext();
  const { isAdmin, currentUser } = useAuth();
  const { addAction } = useActions(goal?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);

  const progress = useMemo(
    () => (goal ? calcGoalProgress(goal, state.actions, state.tasks) : 0),
    [goal, state.actions, state.tasks]
  );

  const goalActions = useMemo(
    () => (goal ? state.actions.filter((a) => a.goalId === goal.id) : []),
    [goal, state.actions]
  );

  const completedActions = useMemo(
    () => goalActions.filter((a) => calcActionProgress(a, state.tasks) === 100).length,
    [goalActions, state.tasks]
  );

  if (!goal) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[10px] bg-[var(--color-card)] p-8 text-center shadow-card">
        <div className="text-[40px] leading-none">🎯</div>
        <div className="mt-2.5 font-semibold text-[var(--color-text)]">No goal selected</div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Select a goal from the left or add a goal to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] rounded-[10px] bg-[var(--color-card)] p-3.5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="m-0 text-xl font-semibold text-[var(--color-text)]">{goal.name}</h2>
            <div className="rounded-pill bg-[#eef2ff] px-2 py-1 text-xs font-semibold text-[var(--color-primary)]">
              {progress}%
            </div>
            <GoalBadge status={goal.status} priority={goal.priority} />
          </div>
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
            Deadline: {formatDeadline(goal.deadline)}
          </p>
          <p className="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
            Owner:{' '}
            <span className="text-[var(--color-text)]">{userDisplayName(goal.ownerId)}</span>
          </p>
          {goal.description ? (
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">{goal.description}</p>
          ) : null}
          <div className="mt-2 w-full max-w-[420px]">
            <ProgressBar value={progress} size="md" gradient />
          </div>
        </div>
        <div className="shrink-0 text-left lg:text-right">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Actions:{' '}
            <span className="font-medium text-[var(--color-text)]">{goalActions.length}</span>
          </p>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Completed Actions:{' '}
            <span className="font-medium text-[var(--color-text)]">{completedActions}</span>
          </p>
          {isAdmin ? (
            <div className="mt-2 flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => setActionFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              >
                + Add Action
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[rgba(37,99,235,0.12)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-3 py-2 text-sm font-semibold text-[var(--color-danger)] hover:opacity-90"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-4">
        <ActionList
          goalId={goal.id}
          restrictUser={!isAdmin}
          currentUserId={currentUser.id}
          hideAddButton={isAdmin}
        />
      </section>

      <ActionForm
        open={actionFormOpen}
        onClose={() => setActionFormOpen(false)}
        goalId={goal.id}
        onCreate={(payload) => addAction({ ...payload, goalId: goal.id })}
      />

      <GoalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialGoal={goal}
        onSave={(payload) => editGoal(goal.id, { ...goal, ...payload })}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete goal"
        message="This will remove the goal and all related actions and tasks."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeGoal(goal.id)}
      />
    </div>
  );
}
