import { useState, useCallback } from 'react';
import staffApi from '../api/staffApi';

export const useStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getStaff(params);
      setStaff(response.staff);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch staff';
      setError(errorMessage);
      console.error('Error fetching staff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addStaff = useCallback(async (staffData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.createStaff(staffData);
      setStaff((prev) => [...prev, response]);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create staff';
      setError(errorMessage);
      console.error('Error creating staff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStaff = useCallback(async (id, staffData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.updateStaff(id, staffData);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? response : s))
      );
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update staff';
      setError(errorMessage);
      console.error('Error updating staff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStaff = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await staffApi.deleteStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete staff';
      setError(errorMessage);
      console.error('Error deleting staff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRole = useCallback(async (id, role) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.assignRole(id, role);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? response.data : s))
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to assign role';
      setError(errorMessage);
      console.error('Error assigning role:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStaffStatus = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.toggleStaffStatus(id);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? response.data : s))
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle status';
      setError(errorMessage);
      console.error('Error toggling status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    assignRole,
    toggleStaffStatus,
  };
};

export default useStaff;
