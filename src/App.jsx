import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import AppLayout from './components/Layout/AppLayout';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import LeadGeneration from './pages/LeadGeneration';
import LeadManagement from './pages/LeadManagement';
import LeadDetail from './pages/LeadDetail';
import Campaigns from './pages/Campaigns';
import EmailLogs from './pages/EmailLogs';
import CompanyProfile from './pages/CompanyProfile';
import ImportExport from './pages/ImportExport';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Trash from './pages/Trash';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected SaaS App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="lead-generation" element={<LeadGeneration />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="leads/:id" element={<LeadDetail />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="email-templates" element={<Navigate to="/dashboard" replace />} />
              <Route path="email-logs" element={<EmailLogs />} />
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="import-export" element={<ImportExport />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="trash" element={<Trash />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
