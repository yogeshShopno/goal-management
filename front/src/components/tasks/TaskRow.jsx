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
  Activity,
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
import UpdatesSection from '../updates/UpdatesSection';

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
  // ✅ Hooks are always called at the top level — never inside callbacks
  const { state, updateTaskState, addTaskUpdate } = useAppContext();
  const { completeTask, removeTask, reorderTasks, editTask } = useTasks(actionId);
  const { isAdmin, currentUser } = useAuth();
  const [notesOpen, setNotesOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
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
    const capped = Math.min(task.targetValue ?? Infinity, Number.isFinite(n) ? Math.floor(n) : task.currentValue ?? 0);
    setCountDraft(String(capped));
    if (capped !== (task.currentValue ?? 0)) {
      try {
        setUpdatingProgress(true);
        const updated = await updateNumericProgress(task.id, 'set', capped);
        updateTaskState(updated);
        setCountDraft(String(updated.currentValue ?? 0));
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
    if (!isNumeric || !canUpdateNumeric || done || updatingProgress) return;
    const base = Number(task.currentValue ?? 0);
    const target = task.targetValue ?? Infinity;
    const n = delta > 0 ? Math.min(base + delta, target) : Math.max(0, base + delta);
    if (n === base) {
      if (delta > 0 && base >= target) toast.error(`Already at target: ${target}`);
      return;
    }
    setCountDraft(String(n));
    try {
      setUpdatingProgress(true);
      const op = delta > 0 ? 'increment' : 'decrement';
      const updated = await updateNumericProgress(task.id, op);
      updateTaskState(updated);
      setCountDraft(String(updated.currentValue ?? 0));
      toast.success('Progress updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
      setCountDraft(String(task.currentValue ?? 0));
    } finally {
      setUpdatingProgress(false);
    }
  };

  // ✅ addTaskUpdate is from context — no hook call inside callback
  const handleAddUpdate = (payload) => addTaskUpdate(task.id, payload);

  return (
    // Use a block-level wrapper so expansion panels stack below the row bar
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-[#e6edf3] bg-[var(--color-card)] overflow-hidden transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-[var(--color-border-active)]' : 'shadow-sm hover:shadow-md'
      }`}
    >
      {/* ── Main task bar ── */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Drag handle */}
        {enableSort ? (
          <button
            type="button"
            className="hidden shrink-0 text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] md:block cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <span className="hidden w-4 md:block" aria-hidden />
        )}

        {/* Checkbox / Numeric control */}
        {isNumeric ? (
          canUpdateNumeric ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => bumpCount(-1)}
                disabled={done || updatingProgress}
                className={`rounded-md border px-2 py-0.5 text-xs font-bold transition-colors ${
                  done || updatingProgress
                    ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-40'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:border-[var(--color-primary)]'
                }`}
                aria-label="Decrease count"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max={task.targetValue ?? undefined}
                value={countDraft}
                onChange={(e) => setCountDraft(e.target.value)}
                onBlur={persistNumericCount}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    persistNumericCount();
                  }
                }}
                disabled={done || updatingProgress}
                placeholder="0"
                className={`w-12 rounded-md border text-center text-xs font-semibold outline-none transition-colors ${
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
                className={`rounded-md border px-2 py-0.5 text-xs font-bold transition-colors ${
                  done || updatingProgress
                    ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-40'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:border-[var(--color-primary)]'
                }`}
                aria-label="Increase count"
              >
                +
              </button>
              <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                / {task.targetValue}{task.targetType ? ` ${task.targetType}` : ''}
              </span>
              {updatingProgress && (
                <span className="text-[10px] text-[var(--color-text-muted)] italic">saving…</span>
              )}
              {done && (
                <span className="text-[10px] font-semibold text-emerald-600">✓ Done</span>
              )}
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                {task.currentValue ?? 0} / {task.targetValue}
                {task.targetType ? ` ${task.targetType}` : ''}
              </span>
              <span className="text-[10px] text-[var(--color-danger)] italic">No permission</span>
            </div>
          )
        ) : (
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-primary)] cursor-pointer"
            checked={done}
            onChange={(e) => completeTask(task.id, e.target.checked)}
            aria-label="Mark task complete"
          />
        )}

        {/* Task name + meta */}
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold leading-tight ${done ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)]'}`}>
            {task.name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[var(--color-text-muted)]">
            <span>
              Due: {task.deadline
                ? (() => {
                    try { return format(parseISO(task.deadline), 'MMM d, yyyy'); }
                    catch { return task.deadline; }
                  })()
                : '—'}
            </span>
            <span>·</span>
            <span>
              {userDisplayName(task.assignedUserId, state.users)}
            </span>
            <PriorityBadge priority={task.priority} />
            {done && task.completedAt ? (
              <span className="text-emerald-600">
                Completed {format(parseISO(task.completedAt), 'MMM d')}
              </span>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Mobile reorder arrows */}
          {enableSort ? (
            <div className="flex gap-1 md:hidden">
              <button
                type="button"
                onClick={() => move('up')}
                className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
                aria-label="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move('down')}
                className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
                aria-label="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          {canNotes ? (
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className={`rounded border p-1 transition-colors ${
                notesOpen
                  ? 'border-amber-300 bg-amber-50 text-amber-600'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
              }`}
              aria-label={notesOpen ? 'Hide notes' : 'Show notes'}
            >
              {notesOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setUpdatesOpen((v) => !v)}
            className={`rounded border p-1 transition-colors ${
              updatesOpen
                ? 'border-[var(--color-primary)] bg-indigo-50 text-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
            }`}
            aria-label={updatesOpen ? 'Hide updates' : 'Show updates'}
          >
            <Activity className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded border border-[var(--color-border)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {canDelete ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded border border-[var(--color-danger)]/30 p-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Notes panel — expands cleanly below the bar ── */}
      {notesOpen && (
        <div className="border-t border-[var(--color-border)] bg-amber-50/40 px-4 py-3">
          <TaskNotes task={task} expanded={notesOpen} />
        </div>
      )}

      {/* ── Updates panel — expands cleanly below the bar ── */}
      {updatesOpen && (
        <div className="border-t border-[var(--color-border)] bg-slate-50/60 px-4 py-3">
          <UpdatesSection
            item={task}
            onAddUpdate={handleAddUpdate}
          />
        </div>
      )}

      {/* Forms / Dialogs */}
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
