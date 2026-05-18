import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const ROLE_DESCRIPTIONS = {
  admin: {
    label: 'Admin',
    panel: 'border-violet-200 bg-violet-50/80 text-violet-950',
    permissions: [
      'Manage users and staff',
      'View all staff members',
      'Manage goals and tasks',
      'Manage actions',
      'Assign roles and permissions',
    ],
  },
  manager: {
    label: 'Manager',
    panel: 'border-sky-200 bg-sky-50/80 text-sky-950',
    permissions: [
      'View staff members',
      'Manage goals and tasks',
      'View goals and tasks',
      'Manage actions',
      'Create team goals',
    ],
  },
  staff: {
    label: 'Staff',
    panel: 'border-teal-200 bg-teal-50/80 text-teal-950',
    permissions: [
      'View own profile',
      'Manage own goals',
      'View tasks',
      'Manage own tasks',
      'View actions',
    ],
  },
  user: {
    label: 'User',
    panel: 'border-slate-200 bg-slate-50/80 text-slate-900',
    permissions: [
      'View own profile',
      'Manage own goals',
      'Manage own tasks',
      'View goals and tasks',
    ],
  },
};

const inputBase =
  'mt-1 w-full rounded-lg border bg-[var(--color-card)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-primary)]';

export default function StaffForm({ staff, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        password: '',
        phone: staff.phone || '',
        role: staff.role || 'staff',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff',
      });
    }
    setErrors({});
  }, [staff]);

  const fieldClass = (key) =>
    `${inputBase} ${
      key && errors[key] ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
    }`;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!staff && !formData.password) {
      newErrors.password = 'Password is required for new staff';
    } else if (staff && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!staff && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = { ...formData };
      if (staff && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleInfo = formData.role && ROLE_DESCRIPTIONS[formData.role];

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="staff-name" className="text-sm font-medium text-[var(--color-text)]">
          Full name <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          type="text"
          id="staff-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Cooper"
          disabled={isSubmitting}
          className={fieldClass('name')}
          autoComplete="name"
        />
        {errors.name ? <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="staff-email" className="text-sm font-medium text-[var(--color-text)]">
          Work email <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          type="email"
          id="staff-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@company.com"
          disabled={isSubmitting || !!staff}
          className={fieldClass('email')}
          autoComplete="email"
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email}</p>
        ) : null}
        {staff ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Email cannot be changed after creation.</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="staff-password" className="text-sm font-medium text-[var(--color-text)]">
          Password {!staff ? <span className="text-[var(--color-danger)]">*</span> : null}
        </label>
        <input
          type="password"
          id="staff-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={staff ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
          disabled={isSubmitting}
          className={fieldClass('password')}
          autoComplete="new-password"
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password}</p>
        ) : null}
        {staff ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Optional when editing.</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="staff-phone" className="text-sm font-medium text-[var(--color-text)]">
            Phone
          </label>
          <input
            type="tel"
            id="staff-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 · optional"
            disabled={isSubmitting}
            className={fieldClass()}
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="staff-role" className="text-sm font-medium text-[var(--color-text)]">
            Role <span className="text-[var(--color-danger)]">*</span>
          </label>
          <select
            id="staff-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isSubmitting}
            className={fieldClass('role')}
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          {errors.role ? <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.role}</p> : null}
        </div>
      </div>

      {roleInfo ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${roleInfo.panel}`}
        >
          <p className="font-semibold">{roleInfo.label} — default access</p>
          <ul className="mt-2 space-y-1.5">
            {roleInfo.permissions.map((perm) => (
              <li key={perm} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden />
                <span>{perm}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : staff ? 'Save changes' : 'Add staff member'}
        </button>
      </div>
    </form>
  );
}
