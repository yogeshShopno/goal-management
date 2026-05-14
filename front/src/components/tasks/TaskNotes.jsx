import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';

export default function TaskNotes({ task, expanded }) {
  const { isAdmin, currentUser } = useAuth();
  const { editTask } = useTasks(task.actionId?.id || task.actionId);

  // Support populated assignedUserId objects (e.g. { id: '...' }) or bare string IDs
  const assignedId = task.assignedUserId?.id || task.assignedUserId?._id || task.assignedUserId;
  const canView = isAdmin || assignedId === currentUser.id;

  const [draft, setDraft] = useState(task.notes || '');

  useEffect(() => {
    setDraft(task.notes || '');
  }, [task.id, task.notes]);

  // Only render when expanded and authorized
  if (!expanded || !canView) return null;

  const onBlurSave = async () => {
    if (draft === (task.notes || '')) return;
    await editTask(task.id, { ...task, notes: draft });
  };

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Notes &amp; details
      </div>
      <div className="space-y-2">
        {task.description ? (
          <p className="text-sm text-[var(--color-text-muted)]">{task.description}</p>
        ) : null}
        <textarea
          className="min-h-[80px] w-full rounded-lg border border-[var(--color-border)] bg-white p-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={onBlurSave}
          placeholder="Internal notes…"
        />
      </div>
    </div>
  );
}
