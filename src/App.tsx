import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Expenditures from './pages/Expenditures';
import Documents from './pages/Documents';
import Team from './pages/Team';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Assets from './pages/Assets';
import Budgets from './pages/Budgets';
import AdminUsers from './pages/AdminUsers';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { currentUser, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            currentUser ? (
              <Layout>
                <Navigate to="/dashboard" replace />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            currentUser ? (
              <Layout>
                <Tasks />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            currentUser ? (
              <Layout>
                <TaskDetail />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/projects"
          element={
            currentUser ? (
              <Layout>
                <Projects />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            currentUser ? (
              <Layout>
                <ProjectDetail />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/expenditures"
          element={
            currentUser ? (
              <Layout>
                <Expenditures />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/budgets"
          element={
            currentUser ? (
              <Layout>
                <Budgets />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/documents"
          element={
            currentUser ? (
              <Layout>
                <Documents />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/team"
          element={
            currentUser ? (
              <Layout>
                <Team />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/assets"
          element={
            currentUser ? (
              <Layout>
                <Assets />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            currentUser ? (
              <Layout>
                <Reports />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/audit-logs"
          element={
            currentUser && (userProfile?.role === 'admin' || userProfile?.role === 'auditor') ? (
              <Layout>
                <AuditLogs />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            currentUser ? (
              <Layout>
                <Settings />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            currentUser ? (
              <Layout>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            currentUser && userProfile?.role === 'admin' ? (
              <Layout>
                <AdminUsers />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
