import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getDeadlineStatus, getDeadlineLabel, getDeadlineClasses } from '../../utils/deadlineUtils';
import { DEADLINE_STATUS } from '../../constants';

export default function DeadlineBadge({ deadline }) {
  if (!deadline) return null;
  const status = getDeadlineStatus(deadline);
  const label = getDeadlineLabel(deadline);
  const cls = getDeadlineClasses(status);

  let Icon = Clock;
  if (status === DEADLINE_STATUS.OVERDUE) Icon = AlertTriangle;
  if (status === DEADLINE_STATUS.ON_TRACK) Icon = CheckCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-xs font-medium ${cls.text} ${cls.bg} ${cls.border}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
