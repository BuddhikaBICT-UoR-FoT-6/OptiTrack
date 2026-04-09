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
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      {/* Real-time Global Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'ot-toast',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px 24px'
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }} 
      />
      
      <AlertListener />
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
