import { useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { useGoals, filterGoalsForUser } from '../../hooks/useGoals';
import AppShell from '../layout/AppShell';
import Sidebar from '../layout/Sidebar';
import StatsCards from '../stats/StatsCards';
import GoalPanel from '../goals/GoalPanel';

export default function UserDashboard() {
  const { state } = useAppContext();
  const { currentUser } = useAuth();
  const scoped = useMemo(
    () => filterGoalsForUser(state.goals, currentUser),
    [state.goals, currentUser]
  );
  const { goals, filter, sort, setFilter, setSort, selectGoal, selectedGoalId } = useGoals(scoped);

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
    <AppShell
      stats={<StatsCards goals={scoped} actions={state.actions} tasks={state.tasks} />}
      sidebar={
        <Sidebar goals={goals} selectedGoalId={selectedGoalId} onSelectGoal={selectGoal} />
      }
    >
      <GoalPanel goal={selectedGoal} />
    </AppShell>
  );
}
