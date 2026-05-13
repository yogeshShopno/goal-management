import { useEffect, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable, arrayMove } from '@dnd-kit/sortable';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { TASK_STATUS, TASK_TYPE } from '../../constants';
import { userDisplayName } from '../../utils/userDisplay';
import { updateNumericProgress } from '../../api/taskApi';
import PriorityBadge from '../common/PriorityBadge';
import TaskNotes from './TaskNotes';
import TaskForm from './TaskForm';
import ConfirmDialog from '../common/ConfirmDialog';

function TaskRowInner({
  task,
  actionId,
  orderedIds,
  enableSort,
  setNodeRef,
  style,
  dragAttributes,
  dragListeners,
  isDragging,
}) {
  const { state } = useAppContext();
  const { completeTask, removeTask, reorderTasks, editTask } = useTasks(actionId);
  const { isAdmin, currentUser } = useAuth();
  const [notesOpen, setNotesOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isNumeric = task.taskType === TASK_TYPE.NUMERIC;
  const [countDraft, setCountDraft] = useState(() =>
    isNumeric ? String(task.currentValue ?? 0) : '0'
  );

  useEffect(() => {
    if (isNumeric) setCountDraft(String(task.currentValue ?? 0));
  }, [isNumeric, task.id, task.currentValue]);

  const assignedId = task.assignedUserId?.id || task.assignedUserId;
  const assignedStaffId = task.assignedStaffId?.id || task.assignedStaffId;
  const canDelete = isAdmin || assignedId === currentUser.id;
  const canNotes = isAdmin || assignedId === currentUser.id;
  const canUpdateNumeric = isAdmin || assignedId === currentUser.id || assignedStaffId === currentUser.id;
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const move = (dir) => {
    if (!enableSort) return;
    const idx = orderedIds.indexOf(task.id);
    const ni = dir === 'up' ? idx - 1 : idx + 1;
    if (ni < 0 || ni >= orderedIds.length) return;
    reorderTasks(actionId, arrayMove(orderedIds, idx, ni));
  };

  const done = task.status === TASK_STATUS.COMPLETED;

  const persistNumericCount = async () => {
    if (!isNumeric || !canUpdateNumeric || done) return;
    const n = Math.max(0, Number.parseFloat(countDraft));
    const safe = Number.isFinite(n) ? Math.floor(n) : task.currentValue ?? 0;
    setCountDraft(String(safe));
    if (safe !== (task.currentValue ?? 0)) {
      try {
        setUpdatingProgress(true);
        await updateNumericProgress(task.id, 'set', safe);
        // Update local state via editTask
        editTask(task.id, { ...task, currentValue: safe });
        toast.success('Progress updated');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update progress');
        setCountDraft(String(task.currentValue ?? 0));
      } finally {
        setUpdatingProgress(false);
      }
    }
  };

  const bumpCount = async (delta) => {
    if (!isNumeric || !canUpdateNumeric || done) return;
    const base = task.currentValue ?? 0;
    const n = Math.max(0, base + delta);
    setCountDraft(String(n));
    try {
      setUpdatingProgress(true);
      const op = delta > 0 ? 'increment' : 'decrement';
      await updateNumericProgress(task.id, op);
      editTask(task.id, { ...task, currentValue: n });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
      setCountDraft(String(task.currentValue ?? 0));
    } finally {
      setUpdatingProgress(false);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 rounded-md border border-[#e6edf3] bg-[var(--color-card)] px-2 py-2 ${
        isDragging ? 'shadow-md ring-2 ring-[var(--color-border-active)]' : ''
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {enableSort ? (
          <button
            type="button"
            className="hidden pt-1 text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] md:block"
            aria-label="Drag to reorder"
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        ) : (
          <span className="hidden w-5 md:block" aria-hidden />
        )}
        {isNumeric ? (
          canUpdateNumeric ? (
            <div className="mt-0.5 flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => bumpCount(-1)}
                  disabled={done || updatingProgress}
                  className={`rounded border px-2 py-0.5 text-xs font-medium transition-colors ${
                    done || updatingProgress
                      ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                  }`}
                  aria-label="Decrease count"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={countDraft}
                  onChange={(e) => setCountDraft(e.target.value)}
                  onBlur={persistNumericCount}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') persistNumericCount();
                  }}
                  disabled={done || updatingProgress}
                  placeholder="0"
                  className={`w-12 rounded border text-center text-xs font-medium outline-none transition-colors ${
                    done || updatingProgress
                      ? 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] cursor-not-allowed'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20'
                  }`}
                  aria-label="Current progress value"
                />
                <button
                  type="button"
                  onClick={() => bumpCount(1)}
                  disabled={done || updatingProgress}
                  className={`rounded border px-2 py-0.5 text-xs font-medium transition-colors ${
                    done || updatingProgress
                      ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                  }`}
                  aria-label="Increase count"
                >
                  +
                </button>
              </div>
              <span className="text-center text-[11px] text-[var(--color-text-muted)] sm:text-left">
                / {task.targetValue}
                {task.targetType ? ` ${task.targetType}` : ''}
              </span>
              {updatingProgress && (
                <span className="text-[10px] text-[var(--color-text-muted)]">updating...</span>
              )}
              {done && (
                <span className="text-[10px] font-medium text-emerald-600">Completed</span>
              )}
            </div>
          ) : (
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-center text-[11px] text-[var(--color-text-muted)]">
                {task.currentValue ?? 0} / {task.targetValue}
                {task.targetType ? ` ${task.targetType}` : ''}
              </span>
              <span className="text-[10px] text-[var(--color-danger)] italic">No permission</span>
            </div>
          )
        ) : (
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-primary)]"
            checked={done}
            onChange={(e) => completeTask(task.id, e.target.checked)}
            aria-label="Mark task complete"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold ${done ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)]'}`}>
            {task.name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <span>
              Due:{' '}
              {task.deadline
                ? (() => {
                    try {
                      return format(parseISO(task.deadline), 'yyyy-MM-dd');
                    } catch {
                      return task.deadline;
                    }
                  })()
                : '—'}{' '}
              • Responsible: {userDisplayName(task.assignedUserId, state.users)}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
          {done && task.completedAt ? (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Completed {format(parseISO(task.completedAt), 'MMM d, yyyy')}
            </p>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-col gap-1 md:flex-row md:items-center">
          {enableSort ? (
            <div className="flex justify-end gap-1 md:hidden">
              <button
                type="button"
                onClick={() => move('up')}
                className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)]"
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move('down')}
                className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)]"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          {canNotes ? (
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
              aria-label={notesOpen ? 'Hide notes' : 'Show notes'}
            >
              {notesOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded border border-[var(--color-danger)]/30 p-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <TaskNotes task={task} expanded={notesOpen} />

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        actionId={actionId}
        initialTask={task}
        onSave={(id, payload) => editTask(id, payload)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        message="This task will be permanently removed."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeTask(task.id)}
      />
    </li>
  );
}

function SortableTaskRow({ task, actionId, orderedIds }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <TaskRowInner
      task={task}
      actionId={actionId}
      orderedIds={orderedIds}
      enableSort
      setNodeRef={setNodeRef}
      style={style}
      dragAttributes={attributes}
      dragListeners={listeners}
      isDragging={isDragging}
    />
  );
}

export default function TaskRow({ task, actionId, orderedIds, enableSort = true }) {
  if (!enableSort) {
    return (
      <TaskRowInner
        task={task}
        actionId={actionId}
        orderedIds={orderedIds}
        enableSort={false}
        setNodeRef={undefined}
        style={undefined}
        dragAttributes={{}}
        dragListeners={{}}
        isDragging={false}
      />
    );
  }
  return <SortableTaskRow task={task} actionId={actionId} orderedIds={orderedIds} />;
}
