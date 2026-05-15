import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { apiHandler } from '../../utils/apiHandler';
import { fetchUsersAndStaff } from '../../api/userApi';
import { formatDateForInput } from '../../utils/dateUtils';
import { PRIORITY, TASK_STATUS, TASK_TYPE } from '../../constants';

const empty = {
  name: '',
  description: '',
  startDate: '',
  deadline: '',
  assignedUserId: '',
  priority: PRIORITY.MEDIUM,
  status: TASK_STATUS.TODO,
  notes: '',
  taskType: TASK_TYPE.CHECKBOX,
  targetValue: '',
  targetType: '',
  currentValue: '0',
};

export default function TaskForm({ open, onClose, actionId, initialTask, onCreate, onSave }) {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(empty);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      try {
        const data = await fetchUsersAndStaff();
        const list = [...(data || [])];
        if (currentUser && !list.find(s => s.id === currentUser.id)) {
          list.push({
            id: currentUser.id,
            name: `${currentUser.name} (Me)`,
            assignmentType: 'user'
          });
        }
        setStaff(list);
      } catch (err) {
        console.error('Failed to load users/staff:', err);
      }
    };
    loadData();
  }, [open, currentUser]);

  useEffect(() => {
    if (!open) return;
    setAttempted(false);
    if (initialTask) {
      const tt =
        initialTask.taskType === TASK_TYPE.NUMERIC ? TASK_TYPE.NUMERIC : TASK_TYPE.CHECKBOX;
      setForm({
        name: initialTask.name || '',
        description: initialTask.description || '',
        startDate: formatDateForInput(initialTask.startDate) || '',
        deadline: formatDateForInput(initialTask.deadline) || '',
        assignedUserId: initialTask.assignedUserId?.id || initialTask.assignedUserId || initialTask.assignedStaffId?.id || initialTask.assignedStaffId || '',
        
        priority: initialTask.priority || PRIORITY.MEDIUM,
        status: initialTask.status || TASK_STATUS.TODO,
        notes: initialTask.notes || '',
        taskType: tt,
        targetValue:
          initialTask.targetValue != null && initialTask.targetValue !== ''
            ? String(initialTask.targetValue)
            : '',
        targetType: initialTask.targetType || '',
        currentValue:
          initialTask.currentValue != null && initialTask.currentValue !== ''
            ? String(initialTask.currentValue)
            : '0',
      });
    } else {
      setForm(empty);
    }
  }, [open, initialTask]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.startDate) e.startDate = true;
    if (!form.deadline) e.deadline = true;
    if (form.taskType === TASK_TYPE.NUMERIC) {
      const tv = Number(form.targetValue);
      if (!Number.isFinite(tv) || tv < 1) e.targetValue = true;
      if (!form.targetType.trim()) e.targetType = true;
      const cv = Number(form.currentValue);
      if (!Number.isFinite(cv) || cv < 0) e.currentValue = true;
    }
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

  const submit = async () => {
    setAttempted(true);
    if (!form.name.trim() || !form.startDate || !form.deadline) return;

    if (new Date(form.startDate) > new Date(form.deadline)) {
      toast.error('Start date cannot be ahead of deadline');
      return;
    }

    if (form.taskType === TASK_TYPE.NUMERIC) {
      const tv = Number(form.targetValue);
      const cv = Number(form.currentValue);
      if (!Number.isFinite(tv) || tv < 1 || !form.targetType.trim()) return;
      if (!Number.isFinite(cv) || cv < 0) return;
    }
    const isNumeric = form.taskType === TASK_TYPE.NUMERIC;
    
    // Find the assigned user/staff to determine which field to populate
    const assignedPerson = staff.find(u => u.id === form.assignedUserId);
    const isStaff = assignedPerson?.assignmentType === 'staff';
    
    const resolvedActionId =
      actionId || initialTask?.actionId?.id || initialTask?.actionId || null;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      deadline: form.deadline,
      actionId: resolvedActionId,
      assignedUserId: isStaff ? null : (form.assignedUserId || null),
      assignedStaffId: isStaff ? form.assignedUserId : null,
      priority: form.priority,
      status: form.status,
      notes: form.notes,
      completedAt: initialTask?.completedAt ?? null,
      taskType: isNumeric ? TASK_TYPE.NUMERIC : TASK_TYPE.CHECKBOX,
      ...(isNumeric
        ? {
            targetValue: Number(form.targetValue),
            targetType: form.targetType.trim(),
            currentValue: Number(form.currentValue) || 0,
          }
        : {
            targetValue: null,
            targetType: null,
            currentValue: null,
          }),
    };
    
    let res;
    if (initialTask) res = await onSave?.(initialTask.id, payload);
    else res = await onCreate?.(payload);
    
    if (!res?.error) {
      onClose?.();
    }
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
        <div>
          <span className="text-sm font-medium text-[var(--color-text)]">Task type</span>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="radio"
                name="taskType"
                checked={form.taskType === TASK_TYPE.CHECKBOX}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    taskType: TASK_TYPE.CHECKBOX,
                    targetValue: '',
                    targetType: '',
                    currentValue: '0',
                  }))
                }
              />
              Checkbox
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="radio"
                name="taskType"
                checked={form.taskType === TASK_TYPE.NUMERIC}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    taskType: TASK_TYPE.NUMERIC,
                    currentValue: f.currentValue || '0',
                  }))
                }
              />
              Numeric
            </label>
          </div>
        </div>
        {form.taskType === TASK_TYPE.NUMERIC ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--color-text)]">Target value *</label>
              <input
                type="number"
                min={1}
                step={1}
                className={fieldClass('targetValue')}
                value={form.targetValue}
                onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)]">Target type *</label>
              <input
                className={fieldClass('targetType')}
                value={form.targetType}
                onChange={(e) => setForm((f) => ({ ...f, targetType: e.target.value }))}
                placeholder="e.g. call"
              />
             
            </div>

          </div>
        ) : null}
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
            <label className="text-sm font-medium text-[var(--color-text)]">Assignee</label>
            <select
              className={fieldClass('assignedUserId')}
              value={form.assignedUserId}
              onChange={(e) => setForm((f) => ({ ...f, assignedUserId: e.target.value }))}
            >
              <option value="">Unassigned</option>
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
