import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Users, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { useGoals, filterGoalsForUser } from '../../hooks/useGoals';
import AppShell from '../layout/AppShell';
import Sidebar from '../layout/Sidebar';
import StatsCards from '../stats/StatsCards';
import GoalPanel from '../goals/GoalPanel';
import GoalForm from '../goals/GoalForm';
import StaffManagement from '../staff/StaffManagement';

const tabBtn =
  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

export default function AdminDashboard() {
  const { state } = useAppContext();
  const { currentUser } = useAuth();
  const scoped = useMemo(
    () => filterGoalsForUser(state.goals, currentUser),
    [state.goals, currentUser]
  );
  const { goals, filter, sort, setFilter, setSort, selectGoal, selectedGoalId, addGoal } =
    useGoals(scoped);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (selectedGoalId && !goals.some((g) => g.id === selectedGoalId)) {
      selectGoal(null);
    }
  }, [goals, selectedGoalId, selectGoal]);

  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedGoalId) || null,
    [goals, selectedGoalId]
  );

  return (
    <>
      <AppShell
        stats={<StatsCards goals={goals} actions={state.actions} tasks={state.tasks} />}
        sidebar={
          <Sidebar goals={goals} selectedGoalId={selectedGoalId} onSelectGoal={selectGoal} />
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`${tabBtn} ${currentView === 'dashboard'
                  ? 'bg-white text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('staff')}
              className={`${tabBtn} ${currentView === 'staff'
                  ? 'bg-white text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
            >
              <Users className="h-4 w-4" />
              Staff
            </button>
          </div>

          {currentView === 'dashboard' && (
            <button
              type="button"
              onClick={() => setGoalModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-indigo-200 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Goal
            </button>
          )}
        </div>

        {currentView === 'dashboard' ? (
          <GoalPanel goal={selectedGoal} />
        ) : (
          <StaffManagement />
        )}
      </AppShell>

      <GoalForm
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={(payload) => addGoal(payload)}
      />
    </>
  );
}
