import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useActions } from '../../hooks/useActions';
import { useAuth } from '../../hooks/useAuth';
import ActionCard from './ActionCard';
import ActionForm from './ActionForm';
import EmptyState from '../common/EmptyState';

export default function ActionList({ goalId, restrictUser, currentUserId, hideAddButton = false }) {
  const { actions, addAction } = useActions(goalId);
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const visible = useMemo(() => {
    if (!restrictUser) return actions;
    return actions.filter(
      (a) => a.ownerId === currentUserId || (a.assignedUserIds || []).includes(currentUserId)
    );
  }, [actions, restrictUser, currentUserId]);

  return (
    <div className="space-y-4">
      {isAdmin && !hideAddButton ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-card)] hover:bg-[var(--color-primary-hover)]"
          >
            <Plus className="h-4 w-4" />
            Add action
          </button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title="No actions yet"
          description={
            isAdmin
              ? 'Create an action to break this goal into workstreams.'
              : 'You have no actions assigned for this goal yet.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <ActionCard key={a.id} action={a} restrictUser={restrictUser} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <ActionForm
        open={open}
        onClose={() => setOpen(false)}
        goalId={goalId}
        onCreate={(payload) => addAction({ ...payload, goalId })}
      />
    </div>
  );
}
