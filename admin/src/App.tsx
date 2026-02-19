import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';

// Placeholder components for future implementation
const StaffPage = () => <div className="p-4">Personel Yönetimi (Yakında)</div>;
const ApartmentsPage = () => <div className="p-4">Apartman Yönetimi (Yakında)</div>;
const TasksPage = () => <div className="p-4">Görev Yönetimi (Yakında)</div>;
const MapPage = () => <div className="p-4">Harita (Yakında)</div>;
const AnnouncementsPage = () => <div className="p-4">Duyurular (Yakında)</div>;

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
