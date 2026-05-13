import React from "react";

const StaffList = ({ staff, onEdit, onDelete, onToggleStatus }) => {
  const getRoleBadgeClasses = (role) => {
    const roleMap = {
      admin: "bg-indigo-100 text-indigo-900 border-indigo-200",
      manager: "bg-blue-100 text-blue-900 border-blue-200",
      staff: "bg-cyan-100 text-cyan-900 border-cyan-200",
      user: "bg-green-100 text-green-900 border-green-200",
    };
    return roleMap[role] || "bg-gray-100 text-gray-900 border-gray-200";
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      admin: "Admin",
      manager: "Manager",
      staff: "Staff",
      user: "User",
    };
    return roleMap[role] || role;
  };

  return (
    <div className="bg-[var(--color-card)] rounded-lg shadow-md overflow-hidden border border-[var(--color-border)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-primary-light)] border-b-2 border-[var(--color-border)]">
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr
                key={member.id}
                className={`border-b border-[var(--color-border)] transition-colors ${
                  member.isActive
                    ? "hover:bg-[var(--color-primary-light)]"
                    : "opacity-75 bg-red-50 hover:bg-red-100"
                }`}
              >
                <td className="px-6 py-4 text-sm font-semibold text-[var(--color-text)]">{member.name}</td>
                <td className="px-6 py-4 text-sm text-[var(--color-text)]">{member.email}</td>
                <td className="px-6 py-4 text-sm text-[var(--color-text)]">{member.phone || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeClasses(
                      member.role
                    )}`}
                  >
                    {getRoleLabel(member.role)}
                  </span>
                </td>
               
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      member.isActive
                        ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                        : "bg-[var(--color-danger-light)] text-[var(--color-danger)]"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(member)}
                      title="Edit staff"
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onToggleStatus(member)}
                      title={member.isActive ? "Deactivate" : "Activate"}
                      className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                    >
                      {member.isActive ? "🔒" : "🔓"}
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      title="Delete staff"
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      🗑️
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
};

export default StaffList;
