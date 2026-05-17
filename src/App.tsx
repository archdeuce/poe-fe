import { Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Layout from './components/Layout';
import Loader from './components/Loader';
import LabPage from './pages/Lab';
import HeistPage from './pages/Heist';
import MemoryPage from './pages/Memory';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import AdminPage from './pages/Admin';
import { ROUTES } from './utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to={ROUTES.LOGIN.URL} replace />;
  }

  if (requiredRole && (role || '').toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to={ROUTES.MAIN.URL} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <>
      <Loader />
      <Routes>
        <Route
          path={ROUTES.MAIN.URL}
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path={ROUTES.LAB.URL}
          element={
            <Layout>
              <ProtectedRoute>
                <LabPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.HEIST.URL}
          element={
            <Layout>
              <ProtectedRoute>
                <HeistPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.MEMORY.URL}
          element={
            <Layout>
              <ProtectedRoute>
                <MemoryPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.SETTINGS.URL}
          element={
            <Layout>
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.LOGIN.URL}
          element={
            <Layout>
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path={ROUTES.ADMIN.URL}
          element={
            <Layout>
              <ProtectedRoute requiredRole="Admin">
                <AdminPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
