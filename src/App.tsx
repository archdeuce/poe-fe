import { Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Layout from './components/Layout';
import Loader from './components/Loader';
import Lab from './pages/Lab/Lab';
import Heist from './pages/Heist/Heist';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';
import AdminPage from './pages/Admin/Admin';
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

  if (
    requiredRole &&
    (role || '').toLowerCase() !== requiredRole.toLowerCase()
  ) {
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
                <Lab />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.HEIST.URL}
          element={
            <Layout>
              <ProtectedRoute>
                <Heist />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.SETTINGS.URL}
          element={
            <Layout>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path={ROUTES.LOGIN.URL}
          element={
            <Layout>
              <Login />
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
