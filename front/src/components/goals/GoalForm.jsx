import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { apiHandler } from '../../utils/apiHandler';
import { staffApi } from '../../api/staffApi';
import { GOAL_STATUS, PRIORITY } from '../../constants';

const empty = {
  name: '',
  description: '',
  startDate: '',
  deadline: '',
  ownerId: '',
  responsibleId: '',
  status: GOAL_STATUS.IN_PROGRESS,
  priority: PRIORITY.MEDIUM,
};

export default function GoalForm({ open, onClose, initialGoal, onSave }) {
  const { isAdmin, currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(empty);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open || !isAdmin) return;
    apiHandler(
      () => staffApi.getStaff({ limit: 1000 }),
      { onSuccess: (data) => setStaff(data.staff || []) }
    );
  }, [open, isAdmin]);

  useEffect(() => {
    if (!open) return;
    setAttempted(false);
    if (initialGoal) {
      setForm({
        name: initialGoal.name || '',
        description: initialGoal.description || '',
        startDate: initialGoal.startDate || '',
        deadline: initialGoal.deadline || '',
        ownerId:
          initialGoal.ownerId?.id ||
          initialGoal.ownerId ||
          initialGoal.ownerStaffId?.id ||
          initialGoal.ownerStaffId ||
          currentUser?.id ||
          '',
        responsibleId:
          initialGoal.responsibleId?.id ||
          initialGoal.responsibleId ||
          initialGoal.responsibleStaffId?.id ||
          initialGoal.responsibleStaffId ||
          '',
        status: initialGoal.status || GOAL_STATUS.IN_PROGRESS,
        priority: initialGoal.priority || PRIORITY.MEDIUM,
      });
    } else {
      setForm({ ...empty, ownerId: currentUser?.id || '' });
    }
  }, [open, initialGoal, currentUser]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.startDate) e.startDate = true;
    if (!form.deadline) e.deadline = true;
    if (!form.ownerId) e.ownerId = true;
    if (!form.responsibleId) e.responsibleId = true;
    return e;
  }, [form]);

  if (!isAdmin) return null;

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
    if (!form.name.trim() || !form.startDate || !form.deadline || !form.ownerId || !form.responsibleId) return;
    
    // Find owners to determine if they're staff or users
    const owner = staff.find((u) => u.id === form.ownerId);
    const responsible = staff.find((u) => u.id === form.responsibleId);
    const isOwnerStaff = owner?.assignmentType === 'staff';
    const isResponsibleStaff = responsible?.assignmentType === 'staff';

    onSave?.({
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      deadline: form.deadline,
      ownerId: isOwnerStaff ? null : (form.ownerId || null),
      ownerStaffId: isOwnerStaff ? form.ownerId : null,
      responsibleId: isResponsibleStaff ? null : (form.responsibleId || null),
      responsibleStaffId: isResponsibleStaff ? form.responsibleId : null,
      status: form.status,
      priority: form.priority,
    });
    onClose?.();
  };

  return (
    <Modal
      open={open && isAdmin}
      title={initialGoal ? 'Edit goal' : 'Add goal'}
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
          <label className="text-sm font-medium text-[var(--color-text)]">Goal name *</label>
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
            <label className="text-sm font-medium text-[var(--color-text)]">Responsible *</label>
            <select
              className={fieldClass('responsibleId')}
              value={form.responsibleId}
              onChange={(e) => setForm((f) => ({ ...f, responsibleId: e.target.value }))}
            >
              <option value="">Select staff</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
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
