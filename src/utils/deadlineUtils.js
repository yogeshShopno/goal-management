import { differenceInDays, isToday, isPast, parseISO, endOfWeek, isWithinInterval } from 'date-fns';
import { DEADLINE_STATUS } from '../constants';

export function getDeadlineStatus(deadlineStr) {
  if (!deadlineStr) return null;
  const deadline = parseISO(deadlineStr);
  const daysLeft = differenceInDays(deadline, new Date());
  if (isPast(deadline) && !isToday(deadline)) return DEADLINE_STATUS.OVERDUE;
  if (isToday(deadline)) return DEADLINE_STATUS.DUE_TODAY;
  if (daysLeft <= 5) return DEADLINE_STATUS.NEAR;
  return DEADLINE_STATUS.ON_TRACK;
}

export function getDeadlineLabel(deadlineStr) {
  if (!deadlineStr) return '';
  const deadline = parseISO(deadlineStr);
  const daysLeft = differenceInDays(deadline, new Date());
  if (isToday(deadline)) return 'Due Today';
  if (daysLeft === 1) return 'Due Tomorrow';
  if (daysLeft > 1) return `${daysLeft} Days Left`;
  return `Overdue by ${Math.abs(daysLeft)} Day${Math.abs(daysLeft) > 1 ? 's' : ''}`;
}

/**
 * Returns Tailwind CSS classes for deadline coloring.
 * All colors reference CSS variables via arbitrary values.
 */
export function getDeadlineClasses(status) {
  switch (status) {
    case DEADLINE_STATUS.ON_TRACK:
      return {
        text: 'text-[var(--color-success)]',
        bg: 'bg-[var(--color-success-light)]',
        border: 'border-[var(--color-success)]',
      };
    case DEADLINE_STATUS.NEAR:
      return {
        text: 'text-[var(--color-warning)]',
        bg: 'bg-[var(--color-warning-light)]',
        border: 'border-[var(--color-warning)]',
      };
    case DEADLINE_STATUS.DUE_TODAY:
      return {
        text: 'text-[var(--color-warning)]',
        bg: 'bg-[var(--color-warning-light)]',
        border: 'border-[var(--color-warning)]',
      };
    case DEADLINE_STATUS.OVERDUE:
      return {
        text: 'text-[var(--color-danger)]',
        bg: 'bg-[var(--color-danger-light)]',
        border: 'border-[var(--color-danger)]',
      };
    default:
      return { text: 'text-[var(--color-muted)]', bg: '', border: '' };
  }
}

export function isDeadlineThisWeek(deadlineStr) {
  if (!deadlineStr) return false;
  const deadline = parseISO(deadlineStr);
  const now = new Date();
  return isWithinInterval(deadline, { start: now, end: endOfWeek(now, { weekStartsOn: 1 }) });
}
