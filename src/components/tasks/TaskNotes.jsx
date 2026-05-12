import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';

export default function TaskNotes({ task, expanded }) {
  const { isAdmin, currentUser } = useAuth();
  const { editTask } = useTasks(task.actionId);
  const canView = isAdmin || task.assignedUserId === currentUser.id;
  const [draft, setDraft] = useState(task.notes || '');

  useEffect(() => {
    setDraft(task.notes || '');
  }, [task.id, task.notes]);

  if (!canView) return null;

  const onBlurSave = async () => {
    if (draft === (task.notes || '')) return;
    await editTask(task.id, { ...task, notes: draft });
  };

  if (!expanded) return null;

  return (
    <div className="mt-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      <div className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">Notes & details</div>
      <div className="space-y-2">
        {task.description ? (
          <p className="text-sm text-[var(--color-text-muted)]">{task.description}</p>
        ) : null}
        <textarea
          className="min-h-[96px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={onBlurSave}
          placeholder="Internal notes…"
        />
      </div>
    </div>
  );
}
