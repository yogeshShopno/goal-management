/**
 * Formats a date string or Date object to YYYY-MM-DD format for HTML date inputs
 * @param {string|Date} date - The date to format
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}