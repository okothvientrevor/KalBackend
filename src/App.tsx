import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import NewTask from './pages/NewTask';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
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
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
        path="/tasks/new"
        element={
          currentUser ? (
            <Layout>
              <NewTask />
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
        path="/projects/new"
        element={
          currentUser ? (
            <Layout>
              <NewProject />
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
      <Route
        path="/admin/dashboard"
        element={
          currentUser ? (
            <Layout>
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin/approvals"
        element={
          currentUser ? (
            <Layout>
              <ProtectedRoute allowedRoles={['admin', 'project_manager', 'finance']}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Approvals Queue</h2>
                  <p className="text-gray-600">Coming soon - Approval management interface</p>
                </div>
              </ProtectedRoute>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin/verifications"
        element={
          currentUser ? (
            <Layout>
              <ProtectedRoute allowedRoles={['admin', 'project_manager']}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Task Verifications</h2>
                  <p className="text-gray-600">Coming soon - Task verification interface</p>
                </div>
              </ProtectedRoute>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
