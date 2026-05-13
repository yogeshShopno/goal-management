import axiosInstance from './axiosInstance';
import { staffApi } from './staffApi';

export async function fetchUsers() {
  const { data } = await axiosInstance.get('/users');
  return data.data;
}

export async function fetchUserById(id) {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data.data;
}

// Fetch both users and staff for assignment options
export async function fetchUsersAndStaff() {
  try {
    const [usersRes, staffRes] = await Promise.all([
      axiosInstance.get('/users'),
      staffApi.getStaff({ limit: 1000 }), // Get all staff
    ]);
    
    const users = usersRes.data.data || [];
    const staff = (staffRes.staff || []).map(s => ({
      ...s,
      assignmentType: 'staff', // Mark as staff for backend reference
    }));
    
    return [...users, ...staff];
  } catch (error) {
    console.error('Error fetching users and staff:', error);
    // Fallback to just users if staff fetch fails
    const { data } = await axiosInstance.get('/users');
    return data.data || [];
  }
}
