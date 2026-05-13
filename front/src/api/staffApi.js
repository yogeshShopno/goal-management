import axiosInstance from './axiosInstance';

export const staffApi = {
  // Create new staff
  createStaff: async (staffData) => {
    const { data } = await axiosInstance.post('/staff', staffData);
    return data.data;
  },

  // Get all staff for the admin
  getStaff: async (params = {}) => {
    const { data } = await axiosInstance.get('/staff', { params });
    const payload = data?.data;
    return (
      payload ?? {
        staff: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      }
    );
  },

  // Get staff by ID
  getStaffById: async (id) => {
    const { data } = await axiosInstance.get(`/staff/${id}`);
    return data.data;
  },

  // Update staff details
  updateStaff: async (id, staffData) => {
    const { data } = await axiosInstance.patch(`/staff/${id}`, staffData);
    return data.data;
  },

  // Assign role to staff
  assignRole: async (id, role) => {
    const { data } = await axiosInstance.patch(`/staff/${id}/role`, { role });
    return data.data;
  },

  // Toggle staff status (activate/deactivate)
  toggleStaffStatus: async (id) => {
    const { data } = await axiosInstance.patch(`/staff/${id}/toggle-status`);
    return data.data;
  },

  // Delete staff
  deleteStaff: async (id) => {
    const { data } = await axiosInstance.delete(`/staff/${id}`);
    return data;
  },
};

export default staffApi;
