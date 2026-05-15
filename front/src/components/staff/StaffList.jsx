import { Pencil, Trash2, UserCheck, UserX } from 'lucide-react';

const roleBadge = (role) => {
  const map = {
    admin: 'border-violet-300/60 bg-violet-50 text-violet-900',
    manager: 'border-sky-300/60 bg-sky-50 text-sky-900',
    staff: 'border-teal-300/60 bg-teal-50 text-teal-900',
    user: 'border-slate-300/60 bg-slate-50 text-slate-800',
  };
  return map[role] || 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]';
};

const roleLabel = (role) =>
  ({ admin: 'Admin', manager: 'Manager', staff: 'Staff', user: 'User' }[role] ||
  role);

const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-active)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25';

export default function StaffList({ staff, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
        {staff.map((member) => (
          <div
            key={member.id ?? member._id}
            className={`rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm transition-all ${
              !member.isActive ? 'opacity-70 bg-slate-50' : ''
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-base font-bold text-[var(--color-text)]">{member.name}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{member.email}</div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadge(member.role)}`}
              >
                {roleLabel(member.role)}
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Phone:</span>
                <span className="font-medium text-[var(--color-text)]">{member.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Status:</span>
                <span
                  className={`font-bold ${
                    member.isActive ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] py-2 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onToggleStatus(member)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] py-2 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                {member.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                {member.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(member)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80">
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Name
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Email
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Phone
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Role
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {staff.map((member) => (
              <tr
                key={member.id ?? member._id}
                className={`transition-colors ${
                  member.isActive
                    ? 'hover:bg-[var(--color-primary-light)]/40'
                    : 'bg-[var(--color-bg)]/50 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                }`}
              >
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-[var(--color-text)]">{member.name}</span>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3.5 text-[var(--color-text)]">{member.email}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text-muted)]">
                  {member.phone || '—'}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadge(member.role)}`}
                  >
                    {roleLabel(member.role)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      member.isActive
                        ? 'border-emerald-300/50 bg-emerald-50 text-emerald-900'
                        : 'border-amber-300/50 bg-amber-50 text-amber-900'
                    }`}
                  >
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(member)}
                      title="Edit"
                      className={iconBtn}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(member)}
                      title={member.isActive ? 'Deactivate' : 'Activate'}
                      className={iconBtn}
                    >
                      {member.isActive ? (
                        <UserX className="h-4 w-4" aria-hidden />
                      ) : (
                        <UserCheck className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(member)}
                      title="Remove"
                      className={`${iconBtn} border-[var(--color-danger)]/25 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
