import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Tracking from './pages/Tracking';
import Analytics from './pages/Analytics';
import Safety from './pages/Safety';
import useAuthStore from './store/useAuthStore';

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Dashboard is now live! */}
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

        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
