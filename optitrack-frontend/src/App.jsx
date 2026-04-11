import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Tracking from './pages/Tracking';
import Analytics from './pages/Analytics';
import Safety from './pages/Safety';
import AIInsights from './pages/AIInsights';
import CustomerPortal from './pages/CustomerPortal';
import AlertListener from './components/AlertListener';
import useAuthStore from './store/useAuthStore';

const App = () => {
  const { isAuthenticated, hasRole } = useAuthStore();

  return (
    <Router>
      {/* Real-time Global Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'ot-toast',
          duration: 5000,
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            color: '#f8fafc',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            style: {
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(15, 23, 42, 0.95)',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#0f172a',
            },
          },
          error: {
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(15, 23, 42, 0.95)',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0f172a',
            },
          },
          loading: {
            style: {
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(15, 23, 42, 0.95)',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#0f172a',
            },
          },
        }} 
      />
      
      {isAuthenticated && (hasRole('ROLE_ADMIN') || hasRole('ROLE_DISPATCHER')) && (
        <AlertListener />
      )}
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/fleet"
          element={isAuthenticated ? <Fleet /> : <Navigate to="/login" />}
        />

        <Route
          path="/drivers"
          element={isAuthenticated ? <Drivers /> : <Navigate to="/login" />}
        />

        <Route
          path="/ai-insights"
          element={isAuthenticated ? <AIInsights /> : <Navigate to="/login" />}
        />

        <Route
          path="/tracking"
          element={isAuthenticated ? <Tracking /> : <Navigate to="/login" />}
        />

        <Route
          path="/analytics"
          element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}
        />

        <Route
          path="/safety"
          element={isAuthenticated ? <Safety /> : <Navigate to="/login" />}
        />

        <Route
          path="/customer"
          element={isAuthenticated ? <CustomerPortal /> : <Navigate to="/login" />}
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

// Operational Sync: 2026-04-08
