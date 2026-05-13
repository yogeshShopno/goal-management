import React, { useState, useCallback } from "react";
import staffApi from "../../api/staffApi";
import StaffList from "./StaffList";
import StaffForm from "./StaffForm";
import Modal from "../common/Modal";
import ConfirmDialog from "../common/ConfirmDialog";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    action: null,
    staffId: null,
    message: "",
  });
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch staff list
  const fetchStaff = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const params = {
          page,
          limit: pagination.limit,
          ...(filters.role && { role: filters.role }),
          ...(filters.isActive !== "" && { isActive: filters.isActive }),
        };
        const response = await staffApi.getStaff(params);
        setStaff(response.staff);
        setPagination(response.pagination);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load staff");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  React.useEffect(() => {
    fetchStaff(1);
  }, [filters]);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingStaff) {
        await staffApi.updateStaff(editingStaff.id, formData);
        setError("");
        alert("Staff updated successfully");
      } else {
        await staffApi.createStaff(formData);
        setError("");
        alert("Staff created successfully");
      }
      setShowForm(false);
      setEditingStaff(null);
      await fetchStaff(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save staff");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteStaff = async () => {
    try {
      setLoading(true);
      await staffApi.deleteStaff(confirmDialog.staffId);
      setError("");
      alert("Staff deleted successfully");
      setConfirmDialog({ show: false, action: null, staffId: null, message: "" });
      await fetchStaff(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete staff");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await staffApi.toggleStaffStatus(confirmDialog.staffId);
      setError("");
      setConfirmDialog({ show: false, action: null, staffId: null, message: "" });
      await fetchStaff(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setShowForm(true);
  };

  // Open delete confirmation
  const handleOpenDeleteConfirm = (staffMember) => {
    setConfirmDialog({
      show: true,
      action: "delete",
      staffId: staffMember.id,
      message: `Are you sure you want to delete ${staffMember.name}?`,
    });
  };

  // Open status toggle confirmation
  const handleOpenStatusConfirm = (staffMember) => {
    setConfirmDialog({
      show: true,
      action: "toggleStatus",
      staffId: staffMember.id,
      message: `Are you sure you want to ${
        staffMember.isActive ? "deactivate" : "activate"
      } ${staffMember.name}?`,
    });
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">Staff Management</h1>
          <p className="text-[var(--color-text-muted)]">Manage your team members and assign roles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="whitespace-nowrap bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-[var(--color-danger-light)] text-[var(--color-danger)] rounded-lg border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange("role", e.target.value)}
          className="px-4 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)] font-medium cursor-pointer transition-all hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
          <option value="user">User</option>
        </select>

        <select
          value={filters.isActive}
          onChange={(e) => handleFilterChange("isActive", e.target.value)}
          className="px-4 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)] font-medium cursor-pointer transition-all hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)]"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && staff.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-card)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
          <p className="text-lg text-[var(--color-text-muted)] mb-6">No staff members found</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg hover:scale-105"
          >
            Add your first staff member
          </button>
        </div>
      ) : (
        <>
          <StaffList
            staff={staff}
            onEdit={handleEditStaff}
            onDelete={handleOpenDeleteConfirm}
            onToggleStatus={handleOpenStatusConfirm}
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchStaff(pagination.page - 1)}
                className="px-4 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg font-semibold text-[var(--color-text)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[var(--color-text)] font-semibold">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchStaff(pagination.page + 1)}
                className="px-4 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg font-semibold text-[var(--color-text)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={handleCloseForm} title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}>
        <StaffForm
          staff={editingStaff}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
        />
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.show}
        title={confirmDialog.action === "delete" ? "Delete Staff" : "Update Status"}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.action === "delete" ? "Delete" : "Confirm"}
        onConfirm={
          confirmDialog.action === "delete"
            ? handleDeleteStaff
            : handleToggleStatus
        }
        onClose={() =>
          setConfirmDialog({
            show: false,
            action: null,
            staffId: null,
            message: "",
          })
        }
      />
    </div>
  );
};

export default StaffManagement;
