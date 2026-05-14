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

// Fetch staff for assignment options
export async function fetchUsersAndStaff() {
  try {
    const staffRes = await staffApi.getStaff({ limit: 1000 }); // Get all staff
    
    const staff = (staffRes.staff || []).map(s => ({
      ...s,
      assignmentType: 'staff', // Mark as staff for backend reference
    }));
    
    return [...staff];
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}
