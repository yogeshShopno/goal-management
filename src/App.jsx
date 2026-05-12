import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './components/dashboard/AdminDashboard';
import UserDashboard from './components/dashboard/UserDashboard';

function DashboardRouter() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: 'var(--radius-md)',
            },
            success: {
              style: {
                background: 'var(--color-success)',
                color: '#ffffff',
              },
            },
            error: {
              style: {
                background: 'var(--color-danger)',
                color: '#ffffff',
              },
            },
          }}
        />
        <DashboardRouter />
      </AppProvider>
    </AuthProvider>
  );
}
