import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useGoals } from '../../hooks/useGoals';
import AppShell from '../layout/AppShell';
import Sidebar from '../layout/Sidebar';
import FilterBar from '../common/FilterBar';
import StatsCards from '../stats/StatsCards';
import GoalPanel from '../goals/GoalPanel';
import GoalForm from '../goals/GoalForm';
import StaffManagement from '../staff/StaffManagement';

export default function AdminDashboard() {
  const { state } = useAppContext();
  const { goals, filter, sort, setFilter, setSort, selectGoal, selectedGoalId, addGoal } =
    useGoals();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (selectedGoalId && !goals.some((g) => g.id === selectedGoalId)) {
      selectGoal(null);
    }
  }, [goals, selectedGoalId, selectGoal]);

  const selectedGoal = useMemo(
    () => state.goals.find((g) => g.id === selectedGoalId) || null,
    [state.goals, selectedGoalId]
  );

  return (
    <>
      {currentView === 'dashboard' ? (
        <AppShell
          stats={<StatsCards goals={state.goals} actions={state.actions} tasks={state.tasks} />}
          sidebar={
            <Sidebar goals={goals} selectedGoalId={selectedGoalId} onSelectGoal={selectGoal} />
          }
        >
          <div className="space-y-5">
            {/* Admin Navigation Tabs */}
            <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('staff')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all flex items-center gap-2 ${
                    currentView === 'staff'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users size={18} />
                  Staff Management
                </button>
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">Workspace</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Create and manage goals from the workspace panel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  Create Goal
                </button>
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <FilterBar filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
            </div>

            <GoalPanel goal={selectedGoal} />
          </div>
        </AppShell>
      ) : (
        <div className="min-h-screen bg-[var(--color-bg)]">
          <div className="border-b border-[var(--color-border)] bg-white shadow-sm">
            <div className="mx-auto w-full max-w-[1100px] px-5 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('staff')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all flex items-center gap-2 ${
                    currentView === 'staff'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users size={18} />
                  Staff Management
                </button>
              </div>
            </div>
          </div>
          <StaffManagement />
        </div>
      )}

      <GoalForm
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={(payload) => addGoal(payload)}
      />
    </>
  );
}
