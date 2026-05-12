import { MOCK_USERS } from '../mock/users.mock';

/** Resolves mock user id to display name; falls back to raw id. */
export function userDisplayName(id) {
  if (!id) return '—';
  return MOCK_USERS.find((u) => u.id === id)?.name || id;
}
