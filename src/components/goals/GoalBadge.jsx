import { GOAL_STATUS } from '../../constants';
import PriorityBadge from '../common/PriorityBadge';

const STATUS_LABEL = {
  [GOAL_STATUS.NOT_STARTED]: 'Not started',
  [GOAL_STATUS.IN_PROGRESS]: 'In progress',
  [GOAL_STATUS.COMPLETED]: 'Completed',
  [GOAL_STATUS.ON_HOLD]: 'On hold',
};

export default function GoalBadge({ status, priority }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PriorityBadge priority={priority} />
      <span className="rounded-pill border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
        {STATUS_LABEL[status] || status}
      </span>
    </div>
  );
}
