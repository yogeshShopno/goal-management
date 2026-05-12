import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { calcActionProgress } from '../../utils/progressCalculator';
import { getDeadlineStatus } from '../../utils/deadlineUtils';
import { DEADLINE_STATUS } from '../../constants';
import { userDisplayName } from '../../utils/userDisplay';
import ProgressBar from '../common/ProgressBar';
import PriorityBadge from '../common/PriorityBadge';
import TaskList from '../tasks/TaskList';
import ActionForm from './ActionForm';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ActionCard({ action, restrictUser, currentUserId }) {
  const { state, editAction, removeAction } = useAppContext();
  const { currentUser, isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const progress = useMemo(
    () => calcActionProgress(action, state.tasks),
    [action, state.tasks]
  );

  const overdue =
    getDeadlineStatus(action.deadline) === DEADLINE_STATUS.OVERDUE && progress < 100;

  const canAddTask =
    isAdmin ||
    action.ownerId === currentUser.id ||
    (action.assignedUserIds || []).includes(currentUser.id);

  const deadlineLabel = action.deadline
    ? (() => {
        try {
          return format(parseISO(action.deadline), 'yyyy-MM-dd');
        } catch {
          return action.deadline;
        }
      })()
    : '—';

  return (
    <div
      className={`mb-2.5 rounded-lg border border-[#eef2ff] bg-[var(--color-card)] p-2.5 last:mb-0 ${
        overdue ? 'border-l-4 border-l-[var(--color-danger)] border-[#eef2ff]' : ''
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-[var(--color-text)]">{action.name}</strong>
            <small className="text-[13px] text-[var(--color-text-muted)]">(by {deadlineLabel})</small>
            <div className="ml-2 rounded-pill bg-[#eef2ff] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
              {progress}%
            </div>
            <PriorityBadge priority={action.priority} />
          </div>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            Owner: <span className="text-[var(--color-text)]">{userDisplayName(action.ownerId)}</span>
          </p>
          {action.description ? (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{action.description}</p>
          ) : null}
          <div className="mt-2 max-w-[320px]">
            <ProgressBar value={progress} size="sm" gradient />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1 text-left md:text-right">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Tasks:{' '}
            <span className="font-medium text-[var(--color-text)]">
              {state.tasks.filter((t) => t.actionId === action.id).length}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[rgba(37,99,235,0.12)] bg-transparent px-2 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-2 py-1 text-xs font-semibold text-[var(--color-danger)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-[rgba(37,99,235,0.12)] bg-transparent px-2 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Tasks
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-2.5 border-t border-[#eef2ff] pt-2.5 pl-2.5">
          <TaskList
            actionId={action.id}
            showAddButton={canAddTask}
            restrictUser={restrictUser}
            currentUserId={currentUserId}
          />
        </div>
      ) : null}

      <ActionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        goalId={action.goalId}
        initialAction={action}
        onSave={(id, payload) => editAction(id, payload)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete action"
        message="This will remove the action and its tasks."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeAction(action.id)}
      />
    </div>
  );
}
