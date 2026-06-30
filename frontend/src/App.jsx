import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Citizen Pages
import Login from './pages/citizen/Login';
import Register from './pages/citizen/Register';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitIssue from './pages/citizen/SubmitIssue';
import MyIssues from './pages/citizen/MyIssues';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import IssueDetail from './pages/admin/IssueDetail';
import Analytics from './pages/admin/Analytics';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Citizen (protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/submit" element={
            <ProtectedRoute>
              <SubmitIssue />
            </ProtectedRoute>
          } />
          <Route path="/my-issues" element={
            <ProtectedRoute>
              <MyIssues />
            </ProtectedRoute>
          } />

          {/* Admin (protected + admin-only) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/issues" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/issues/:id" element={
            <ProtectedRoute requireAdmin>
              <IssueDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requireAdmin>
              <Analytics />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="page-wrapper">
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏚️</div>
                <h1>404 — Page Not Found</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                  The page you're looking for doesn't exist.
                </p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
