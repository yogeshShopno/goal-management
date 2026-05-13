import React, { useState, useEffect } from "react";

const ROLE_DESCRIPTIONS = {
  admin: {
    label: "Admin",
    color: "bg-indigo-100 text-indigo-900",
    permissions: [
      "Manage users and staff",
      "View all staff members",
      "Manage goals and tasks",
      "Manage actions",
      "Assign roles and permissions",
    ],
  },
  manager: {
    label: "Manager",
    color: "bg-blue-100 text-blue-900",
    permissions: [
      "View staff members",
      "Manage goals and tasks",
      "View goals and tasks",
      "Manage actions",
      "Create team goals",
    ],
  },
  staff: {
    label: "Staff",
    color: "bg-green-100 text-green-900",
    permissions: [
      "View own profile",
      "Manage own goals",
      "View tasks",
      "Manage own tasks",
      "View actions",
    ],
  },
  user: {
    label: "User",
    color: "bg-gray-100 text-gray-900",
    permissions: [
      "View own profile",
      "Manage own goals",
      "Manage own tasks",
      "View goals and tasks",
    ],
  },
};

const StaffForm = ({ staff, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",

  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        password: "", // Don't pre-fill password
        phone: staff.phone || "",
        role: staff.role || "staff",

      });
    }
  }, [staff]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!staff && !formData.password) {
      newErrors.password = "Password is required for new staff";
    } else if (staff && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!staff && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Only send password if updating and password is provided, or if creating new staff
      const submitData = { ...formData };
      if (staff && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          Name <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter staff name"
          disabled={isSubmitting}
          className={`w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed ${
            errors.name ? "border-[var(--color-danger)] bg-[var(--color-danger-light)]" : "border-[var(--color-border)] bg-[var(--color-card)]"
          }`}
        />
        {errors.name && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          Email <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          disabled={isSubmitting || !!staff}
          className={`w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed ${
            errors.email ? "border-[var(--color-danger)] bg-[var(--color-danger-light)]" : "border-[var(--color-border)] bg-[var(--color-card)]"
          }`}
        />
        {errors.email && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.email}</p>}
        {staff && <p className="text-xs text-[var(--color-text-muted)] mt-1">Email cannot be changed</p>}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          Password {!staff && <span className="text-[var(--color-danger)]">*</span>}
          {staff && <span className="text-xs text-[var(--color-text-muted)]"> (Leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={staff ? "Leave blank to keep current password" : "Enter password"}
          disabled={isSubmitting}
          className={`w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed ${
            errors.password ? "border-[var(--color-danger)] bg-[var(--color-danger-light)]" : "border-[var(--color-border)] bg-[var(--color-card)]"
          }`}
        />
        {errors.password && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.password}</p>}
      </div>

      {/* Grid: Phone and Role */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Role <span className="text-[var(--color-danger)]">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed ${
              errors.role ? "border-[var(--color-danger)] bg-[var(--color-danger-light)]" : "border-[var(--color-border)] bg-[var(--color-card)]"
            }`}
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          {errors.role && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.role}</p>}
        </div>
      </div>


      {/* Role Permissions Info */}
      {formData.role && ROLE_DESCRIPTIONS[formData.role] && (
        <div className={`p-4 rounded-lg border border-[var(--color-border)] ${ROLE_DESCRIPTIONS[formData.role].color}`}>
          <h4 className="font-semibold mb-2">{ROLE_DESCRIPTIONS[formData.role].label} Permissions</h4>
          <ul className="space-y-1">
            {ROLE_DESCRIPTIONS[formData.role].permissions.map((perm, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>{perm}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? "Saving..." : staff ? "Update Staff" : "Add Staff"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)] font-semibold py-2.5 rounded-lg transition-all hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
