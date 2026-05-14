import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { apiHandler } from '../../utils/apiHandler';
import { fetchUsersAndStaff } from '../../api/userApi';
import { formatDateForInput } from '../../utils/dateUtils';
import { ACTION_STATUS, PRIORITY } from '../../constants';

const empty = {
  name: '',
  description: '',
  startDate: '',
  deadline: '',
  ownerId: '',
  assignedUserIds: [],
  assignedStaffIds: [],
  priority: PRIORITY.MEDIUM,
  status: ACTION_STATUS.PENDING,
};

export default function ActionForm({ open, onClose, goalId, initialAction, onCreate, onSave }) {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(empty);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    apiHandler(() => fetchUsersAndStaff(), { onSuccess: (data) => setStaff(data || []) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setAttempted(false);
    if (initialAction) {
      setForm({
        name: initialAction.name || '',
        description: initialAction.description || '',
        startDate: formatDateForInput(initialAction.startDate) || '',
        deadline: formatDateForInput(initialAction.deadline) || '',
        ownerId: initialAction.ownerId?.id || initialAction.ownerId || initialAction.ownerStaffId?.id || initialAction.ownerStaffId || '',
        assignedUserIds: (initialAction.assignedUserIds || []).map((u) => u.id || u),
        assignedStaffIds: (initialAction.assignedStaffIds || []).map((s) => s.id || s),
        priority: initialAction.priority || PRIORITY.MEDIUM,
        status: initialAction.status || ACTION_STATUS.PENDING,
      });
    } else {
      setForm({ ...empty, ownerId: currentUser?.id || '' });
    }
  }, [open, initialAction, currentUser]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.startDate) e.startDate = true;
    if (!form.deadline) e.deadline = true;
    if (!form.ownerId) e.ownerId = true;
    return e;
  }, [form]);

  const inputBase =
    'mt-1 w-full rounded-md border bg-[var(--color-card)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]';

  const fieldClass = (key) =>
    `${inputBase} ${
      key && attempted && errors[key]
        ? 'border-[var(--color-danger)]'
        : 'border-[var(--color-border)]'
    }`;

  const toggleAssignee = (id, isStaff = false) => {
    setForm((f) => {
      const key = isStaff ? 'assignedStaffIds' : 'assignedUserIds';
      const set = new Set(f[key]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...f, [key]: [...set] };
    });
  };

  const submit = () => {
    setAttempted(true);
    if (!form.name.trim() || !form.startDate || !form.deadline || !form.ownerId) return;
    
    // Find the owner to determine if it's staff or user
    const owner = staff.find(u => u.id === form.ownerId);
    const isOwnerStaff = owner?.assignmentType === 'staff';
    
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      deadline: form.deadline,
      ownerId: isOwnerStaff ? null : (form.ownerId || null),
      ownerStaffId: isOwnerStaff ? form.ownerId : null,
      assignedUserIds: form.assignedUserIds,
      assignedStaffIds: form.assignedStaffIds,
      priority: form.priority,
      status: form.status,
    };
    if (initialAction) onSave?.(initialAction.id, { ...initialAction, ...payload });
    else onCreate?.({ ...payload, goalId });
    onClose?.();
  };

  return (
    <Modal
      open={open}
      title={initialAction ? 'Edit action' : 'Add action'}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-card)] hover:bg-[var(--color-primary-hover)]"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Action name *</label>
          <input
            className={fieldClass('name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Description</label>
          <textarea
            className={fieldClass()}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">Start date *</label>
            <input
              type="date"
              className={fieldClass('startDate')}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">Deadline *</label>
            <input
              type="date"
              className={fieldClass('deadline')}
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">Owner *</label>
            <select
              className={fieldClass('ownerId')}
              value={form.ownerId}
              onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
            >
              <option value="">Select owner</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
       
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">Status</label>
            <select
              className={fieldClass()}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {Object.values(ACTION_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">Priority</label>
            <select
              className={fieldClass()}
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value={PRIORITY.HIGH}>High</option>
              <option value={PRIORITY.MEDIUM}>Medium</option>
              <option value={PRIORITY.LOW}>Low</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
