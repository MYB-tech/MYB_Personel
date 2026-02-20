import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import StaffPage from './pages/StaffPage';
import ApartmentsPage from './pages/ApartmentsPage';
import TasksPage from './pages/TasksPage';
import MapPage from './pages/MapPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
