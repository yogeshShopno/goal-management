import { Filter, ArrowUpDown } from 'lucide-react';
import { FILTERS, SORT_OPTIONS } from '../../constants';

const FILTER_LABELS = {
  all: 'All',
  due_today: 'Due Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  overdue: 'Overdue',
  high_priority: 'High Priority',
};

const SORT_LABELS = {
  deadline: 'Deadline',
  priority: 'Priority',
  progress: 'Progress',
  recently_updated: 'Recently Updated',
};

export default function FilterBar({ filter, sort, onFilterChange, onSortChange }) {
  return (
    <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text-muted)]">
          <Filter className="h-4 w-4" />
          Filter
        </span>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`rounded-pill border px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:border-[var(--color-border-active)]'
              }`}
            >
              {FILTER_LABELS[f] || f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text-muted)]">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s] || s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
