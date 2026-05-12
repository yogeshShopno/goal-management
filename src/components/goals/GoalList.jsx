import GoalItem from './GoalItem';

export default function GoalList({ goals, selectedGoalId, onSelect }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {goals.map((g) => (
        <li key={g.id}>
          <GoalItem goal={g} active={g.id === selectedGoalId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
