import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import staffApi from '../../api/staffApi';
import StaffList from './StaffList';
import StaffForm from './StaffForm';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import Loader from '../common/Loader';

const staffIdOf = (member) => member?.id ?? member?._id;

const selectClass =
  'rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text)] outline-none transition-colors hover:border-[var(--color-border-active)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    action: null,
    staffId: null,
    message: '',
  });
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchStaff = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError('');
        const params = {
          page,
          limit: pagination.limit,
          ...(filters.role && { role: filters.role }),
          ...(filters.isActive !== '' && { isActive: filters.isActive }),
        };
        const response = await staffApi.getStaff(params);
        setStaff(response.staff ?? []);
        setPagination((prev) => ({
          ...prev,
          ...(response.pagination || {}),
        }));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load staff';
        setError(msg);
        toast.error(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [filters.role, filters.isActive, pagination.limit]
  );

  useEffect(() => {
    fetchStaff(1);
  }, [fetchStaff]);

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingStaff) {
        await staffApi.updateStaff(staffIdOf(editingStaff), formData);
        setError('');
        toast.success('Staff member updated');
      } else {
        await staffApi.createStaff(formData);
        setError('');
        toast.success('Staff member added');
      }
      setShowForm(false);
      setEditingStaff(null);
      await fetchStaff(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save staff';
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    try {
      setLoading(true);
      await staffApi.deleteStaff(confirmDialog.staffId);
      setError('');
      toast.success('Staff member removed');
      await fetchStaff(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete staff';
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await staffApi.toggleStaffStatus(confirmDialog.staffId);
      setError('');
      toast.success('Status updated');
      await fetchStaff(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update status';
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setShowForm(true);
  };

  const handleOpenDeleteConfirm = (staffMember) => {
    setConfirmDialog({
      show: true,
      action: 'delete',
      staffId: staffIdOf(staffMember),
      message: `Remove ${staffMember.name} from your team? This cannot be undone.`,
    });
  };

  const handleOpenStatusConfirm = (staffMember) => {
    setConfirmDialog({
      show: true,
      action: 'toggleStatus',
      staffId: staffIdOf(staffMember),
      message: `${staffMember.isActive ? 'Deactivate' : 'Activate'} ${staffMember.name}?`,
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeCount = staff.filter((s) => s.isActive).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Users className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Team &amp; access</h2>
           
              {/* {!loading && pagination.total > 0 ? (
                <p className="mt-2 text-xs font-medium text-[var(--color-text-muted)]">
                  {pagination.total} member{pagination.total === 1 ? '' : 's'}
                  {staff.length > 0 ? ` · ${activeCount} active on this page` : ''}
                </p>
              ) : null} */}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingStaff(null);
              setShowForm(true);
            }}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add staff
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-[18px] border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
          <Filter className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
          Filters
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className={`${selectClass} flex-1 min-w-[140px]`}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className={`${selectClass} flex-1 min-w-[140px]`}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-[18px] border border-[var(--color-border)] bg-white shadow-sm">
        {loading && staff.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : !loading && staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Users className="h-8 w-8" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">No staff yet</h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
              Invite your first teammate to delegate work and tighten access control.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingStaff(null);
                setShowForm(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add staff
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center border-b border-[var(--color-border)] py-4">
                <Loader inline />
              </div>
            ) : null}
            <StaffList
              staff={staff}
              onEdit={handleEditStaff}
              onDelete={handleOpenDeleteConfirm}
              onToggleStatus={handleOpenStatusConfirm}
            />
          </>
        )}

        {!loading && staff.length > 0 && pagination.pages > 1 ? (
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchStaff(pagination.page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchStaff(pagination.page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={showForm}
        onClose={handleCloseForm}
        title={editingStaff ? 'Edit staff member' : 'Add staff member'}
        panelClassName="max-w-xl"
      >
        <StaffForm staff={editingStaff} onSubmit={handleFormSubmit} onCancel={handleCloseForm} />
      </Modal>

      <ConfirmDialog
        open={confirmDialog.show}
        title={confirmDialog.action === 'delete' ? 'Remove staff' : 'Update access'}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.action === 'delete' ? 'Remove' : 'Confirm'}
        confirmVariant={confirmDialog.action === 'delete' ? 'danger' : 'primary'}
        onConfirm={confirmDialog.action === 'delete' ? handleDeleteStaff : handleToggleStatus}
        onClose={() =>
          setConfirmDialog({
            show: false,
            action: null,
            staffId: null,
            message: '',
          })
        }
      />
    </div>
  );
}
