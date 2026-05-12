import { useState } from 'react';
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
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { TASK_STATUS } from '../../constants';
import { userDisplayName } from '../../utils/userDisplay';
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
  const { completeTask, removeTask, reorderTasks, editTask } = useTasks(actionId);
  const { isAdmin, currentUser } = useAuth();
  const [notesOpen, setNotesOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canDelete = isAdmin || task.assignedUserId === currentUser.id;
  const canNotes = isAdmin || task.assignedUserId === currentUser.id;

  const move = (dir) => {
    if (!enableSort) return;
    const idx = orderedIds.indexOf(task.id);
    const ni = dir === 'up' ? idx - 1 : idx + 1;
    if (ni < 0 || ni >= orderedIds.length) return;
    reorderTasks(actionId, arrayMove(orderedIds, idx, ni));
  };

  const done = task.status === TASK_STATUS.COMPLETED;

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
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-primary)]"
          checked={done}
          onChange={(e) => completeTask(task.id, e.target.checked)}
          aria-label="Mark task complete"
        />
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
              • Responsible: {userDisplayName(task.assignedUserId)}
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
