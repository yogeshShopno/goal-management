import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useGoals } from '../../hooks/useGoals';
import AppShell from '../layout/AppShell';
import Sidebar from '../layout/Sidebar';
import FilterBar from '../common/FilterBar';
import StatsCards from '../stats/StatsCards';
import GoalPanel from '../goals/GoalPanel';
import GoalForm from '../goals/GoalForm';

export default function AdminDashboard() {
  const { state } = useAppContext();
  const { goals, filter, sort, setFilter, setSort, selectGoal, selectedGoalId, addGoal } =
    useGoals();
  const [goalModalOpen, setGoalModalOpen] = useState(false);

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
      <AppShell
        stats={<StatsCards goals={state.goals} actions={state.actions} tasks={state.tasks} />}
        onAddGoal={() => setGoalModalOpen(true)}
        sidebar={
          <Sidebar goals={goals} selectedGoalId={selectedGoalId} onSelectGoal={selectGoal} />
        }
      >
        <FilterBar filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
        <GoalPanel goal={selectedGoal} />
      </AppShell>
      <GoalForm
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={(payload) => addGoal(payload)}
      />
    </>
  );
}
