import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { apiHandler } from '../../utils/apiHandler';
import { fetchUsers } from '../../api/userApi';
import { PRIORITY, TASK_STATUS } from '../../constants';

const empty = {
  name: '',
  description: '',
  startDate: '',
  deadline: '',
  assignedUserId: '',
  assignedTeam: '',
  priority: PRIORITY.MEDIUM,
  status: TASK_STATUS.TODO,
  notes: '',
};

export default function TaskForm({ open, onClose, actionId, initialTask, onCreate, onSave }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    apiHandler(() => fetchUsers(), { onSuccess: (data) => setUsers(data || []) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setAttempted(false);
    if (initialTask) {
      setForm({
        name: initialTask.name || '',
        description: initialTask.description || '',
        startDate: initialTask.startDate || '',
        deadline: initialTask.deadline || '',
        assignedUserId: initialTask.assignedUserId || '',
        assignedTeam: initialTask.assignedTeam || '',
        priority: initialTask.priority || PRIORITY.MEDIUM,
        status: initialTask.status || TASK_STATUS.TODO,
        notes: initialTask.notes || '',
      });
    } else {
      setForm(empty);
    }
  }, [open, initialTask]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.deadline) e.deadline = true;
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

  const submit = () => {
    setAttempted(true);
    if (!form.name.trim() || !form.deadline) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: form.startDate || null,
      deadline: form.deadline,
      assignedUserId: form.assignedUserId,
      assignedTeam: form.assignedTeam.trim(),
      priority: form.priority,
      status: form.status,
      notes: form.notes,
      completedAt: initialTask?.completedAt ?? null,
    };
    if (initialTask) onSave?.(initialTask.id, { ...initialTask, ...payload });
    else onCreate?.({ ...payload, actionId });
    onClose?.();
  };

  return (
    <Modal
      open={open}
      title={initialTask ? 'Edit task' : 'Add task'}
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
          <label className="text-sm font-medium text-[var(--color-text)]">Task name *</label>
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
            <label className="text-sm font-medium text-[var(--color-text)]">Start date</label>
            <input
              type="date"
              className={fieldClass()}
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
        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Assigned user</label>
          <select
            className={fieldClass()}
            value={form.assignedUserId}
            onChange={(e) => setForm((f) => ({ ...f, assignedUserId: e.target.value }))}
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Team</label>
          <input
            className={fieldClass()}
            value={form.assignedTeam}
            onChange={(e) => setForm((f) => ({ ...f, assignedTeam: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">Status</label>
            <select
              className={fieldClass()}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {Object.values(TASK_STATUS).map((s) => (
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
