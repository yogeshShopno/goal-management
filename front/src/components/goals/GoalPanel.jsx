import { useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, Calendar, User, Info, CheckCircle, ListTodo, Target } from 'lucide-react';
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
  if (!deadline) return 'No deadline set';
  try {
    return format(parseISO(deadline), 'MMMM dd, yyyy');
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

  const owner = goal?.ownerId || goal?.ownerStaffId;
  const responsible = goal?.responsibleId || goal?.responsibleStaffId;

  if (!goal) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm border border-dashed border-[var(--color-border)] animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-[var(--color-primary)] mb-6">
          <Target className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No Goal Selected</h3>
        <p className="max-w-xs text-[var(--color-text-muted)] leading-relaxed">
          Select a goal from your workspace to view detailed progress and manage actions.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] rounded-2xl bg-white p-8 shadow-sm border border-[var(--color-border)] animate-fade-in">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between border-b border-slate-100 pb-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <GoalBadge status={goal.status} priority={goal.priority} />
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em]">
              {progress}% COMPLETED
            </span>
          </div>
          
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-6">
            {goal.name}
          </h2>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Deadline</span>
                <span className="text-sm font-bold text-slate-700">{formatDeadline(goal.deadline)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Owner</span>
                <span className="text-sm font-bold text-slate-700">
                  {userDisplayName(owner, state.users)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Responsible</span>
                <span className="text-sm font-bold text-slate-700">
                  {userDisplayName(responsible, state.users)}
                </span>
              </div>
            </div>
          </div>

          {goal.description && (
            <div className="relative p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 mb-8 overflow-hidden">
              <Info className="absolute -right-2 -bottom-2 h-16 w-16 text-indigo-500/5 pointer-events-none" />
              <p className="relative text-sm text-slate-600 leading-relaxed font-medium italic">
                "{goal.description}"
              </p>
            </div>
          )}

          <div className="w-full max-w-xl bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-2.5 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
              <span className="text-sm font-black text-[var(--color-primary)]">{progress}%</span>
            </div>
            <ProgressBar value={progress} size="lg" gradient />
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-4">
          <div className="flex gap-3 sm:gap-4 lg:flex-col lg:items-end">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">
                {completedActions}/{goalActions.length} Actions Done
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <button
                type="button"
                onClick={() => setActionFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="h-4 w-4" />
                Add Action
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition-all hover:bg-[var(--color-bg)] hover:border-[var(--color-text-light)]"
                >
                  <Pencil className="h-4 w-4 text-[var(--color-text-muted)]" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center justify-center h-[42px] w-[42px] rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 active:scale-95"
                  title="Delete Goal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col max-h-[600px] rounded-2xl border border-[var(--color-border)] bg-slate-50/50 overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-[var(--color-border)] bg-white shrink-0">
          <ListTodo className="h-5 w-5 text-[var(--color-primary)]" />
          <h4 className="text-lg font-bold text-[var(--color-text)] tracking-tight">Action Items</h4>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <ActionList
            goalId={goal.id}
            restrictUser={!isAdmin}
            currentUserId={currentUser.id}
            hideAddButton={isAdmin}
          />
        </div>
      </div>

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
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone and will remove all associated actions and tasks."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeGoal(goal.id)}
      />
    </div>
  );
}

