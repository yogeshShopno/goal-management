import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Calendar, User, MoreVertical, ListTodo } from 'lucide-react';
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
import UpdatesSection from '../updates/UpdatesSection';

export default function ActionCard({ action, restrictUser, currentUserId }) {
  const { state, editAction, removeAction, addActionUpdate } = useAppContext();
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

  const canAddTask = useMemo(() => {
    if (isAdmin) return true;
    const oid = action.ownerId?.id || action.ownerId;
    if (oid === currentUser.id) return true;
    const assignedIds = (action.assignedUserIds || []).map((u) => u.id || u);
    return assignedIds.includes(currentUser.id);
  }, [isAdmin, action, currentUser.id]);

  const deadlineLabel = action.deadline
    ? (() => {
        try {
          return format(parseISO(action.deadline), 'MMM dd, yyyy');
        } catch {
          return action.deadline;
        }
      })()
    : 'No deadline';

  return (
    <div
      className={`group mb-4 rounded-xl border border-[var(--color-border)] bg-white transition-all hover:shadow-md ${
        overdue ? 'border-l-4 border-l-rose-500' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <PriorityBadge priority={action.priority} />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <Calendar className="h-3 w-3" />
                {deadlineLabel}
              </div>
              {overdue && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Overdue
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
              {action.name}
            </h4>

            {action.description && (
              <p className="text-sm text-[var(--color-text-muted)] mb-3 leading-relaxed line-clamp-2">
                {action.description}
              </p>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-[var(--color-primary)]">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  {userDisplayName(action.ownerId, state.users)}
                </span>
              </div>
              
              <div className="flex-1 max-w-[200px] flex items-center gap-3">
                <ProgressBar value={progress} size="xs" gradient />
                <span className="text-xs font-bold text-[var(--color-primary)]">{progress}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <ListTodo className="h-3.5 w-3.5" />
                {state.tasks.filter((t) => t.actionId === action.id).length} Tasks
              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] transition-all ${
                  expanded ? 'bg-indigo-50 text-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-white text-slate-400 hover:text-slate-600'
                }`}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="flex h-8 items-center gap-1.5 px-2.5 rounded-lg border border-[var(--color-border)] bg-white text-xs font-bold text-slate-600 transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border)] bg-slate-50/50 p-4 rounded-b-xl">
          <TaskList
            actionId={action.id}
            showAddButton={canAddTask}
            restrictUser={restrictUser}
            currentUserId={currentUserId}
          />
          <UpdatesSection
            item={action}
            onAddUpdate={(payload) => addActionUpdate(action.id, payload)}
          />
        </div>
      )}

      <ActionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        goalId={action.goalId}
        initialAction={action}
        onSave={(id, payload) => editAction(id, payload)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Action"
        message="Are you sure you want to delete this action? This will also remove all associated tasks."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeAction(action.id)}
      />
    </div>
  );
}

