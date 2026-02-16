import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PetProvider, usePets } from './context/PetContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PetListPage from './pages/PetListPage';
import AddPetPage from './pages/AddPetPage';
import PetDetailPage from './pages/PetDetailPage';
import EditPetPage from './pages/EditPetPage';
import ABCLogWizardPage from './pages/ABCLogWizardPage';
import ABCLogListPage from './pages/ABCLogListPage';
import ABCLogDetailPage from './pages/ABCLogDetailPage';
import InsightsPage from './pages/InsightsPage';
import ProgressPage from './pages/ProgressPage';
import CoachingPage from './pages/CoachingPage';
import SettingsPage from './pages/SettingsPage';
import LoadingSpinner from './components/LoadingSpinner';

function PetLoader({ children }: { children: React.ReactNode }) {
  const { refreshPets } = usePets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refreshPets(); }, []);
  return <>{children}</>;
}

function AuthenticatedApp() {
  return (
    <PetProvider>
      <PetLoader>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pets" element={<PetListPage />} />
            <Route path="/pets/add" element={<AddPetPage />} />
            <Route path="/pets/:petId" element={<PetDetailPage />} />
            <Route path="/pets/:petId/edit" element={<EditPetPage />} />
            <Route path="/abc-logs" element={<ABCLogListPage />} />
            <Route path="/abc-logs/new" element={<ABCLogWizardPage />} />
            <Route path="/abc-logs/:logId" element={<ABCLogDetailPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/coaching" element={<CoachingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PetLoader>
    </PetProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner message="Restoring session..." />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
