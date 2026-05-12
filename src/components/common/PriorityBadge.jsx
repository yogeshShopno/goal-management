import { PRIORITY } from '../../constants';

const map = {
  [PRIORITY.HIGH]: {
    label: 'High',
    className: 'bg-[var(--color-priority-high)]/15 text-[var(--color-priority-high)] border-[var(--color-priority-high)]/40',
  },
  [PRIORITY.MEDIUM]: {
    label: 'Medium',
    className:
      'bg-[var(--color-priority-medium)]/15 text-[var(--color-priority-medium)] border-[var(--color-priority-medium)]/40',
  },
  [PRIORITY.LOW]: {
    label: 'Low',
    className: 'bg-[var(--color-priority-low)]/15 text-[var(--color-priority-low)] border-[var(--color-priority-low)]/40',
  },
};

export default function PriorityBadge({ priority }) {
  const cfg = map[priority] || map[PRIORITY.MEDIUM];
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
