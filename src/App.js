// src/App.js
import 'antd/dist/reset.css';
import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header from "./pages/Header";
import Sidebar from './pages/Sidebar';

import Dashboard from './pages/Dashboard';
import Filiere from './pages/Filiere';
import Classe from './pages/Classe';
import Utilisateur from './pages/Utilisateur';
import Pointage from './pages/Pointage';
import Modules from './pages/Modules';
import Horaires from './pages/Horaires';
import Planning from './pages/Planning';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import PageNotFound from './pages/Error';
import Admin from './pages/Admin';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return children;
};

const AppContent = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isAuthPage = ["/login", "/forgot-password", "/notfound"].includes(location.pathname);
  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  return (
    <ErrorBoundary>
      {isAuthenticated && !isAuthPage && (
        <Header collapsed={isSidebarCollapsed} />
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {isAuthenticated && !isAuthPage && (
          <Sidebar collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        )}

        <div
          style={{
            flex: 1,
            padding: '20px',
            paddingTop: isAuthenticated && !isAuthPage ? '80px' : '0px',
            paddingLeft: isAuthenticated && !isAuthPage
              ? isSidebarCollapsed ? '80px' : '250px'
              : '0px',
            transition: 'padding-left 0.2s ease-in-out',
            background: '#f5f5f5',
          }}
        >
          <ErrorBoundary>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />

              {/* Routes protégées */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/filiere" element={
                <ProtectedRoute>
                  <Filiere />
                </ProtectedRoute>
              } />
              <Route path="/classe" element={
                <ProtectedRoute>
                  <Classe />
                </ProtectedRoute>
              } />
              <Route path="/utilisateurs" element={
                <ProtectedRoute>
                  <Utilisateur />
                </ProtectedRoute>
              } />
              <Route path="/pointages" element={
                <ProtectedRoute>
                  <Pointage />
                </ProtectedRoute>
              } />
              <Route path="/modules" element={
                <ProtectedRoute>
                  <Modules />
                </ProtectedRoute>
              } />
              <Route path="/horaires" element={
                <ProtectedRoute>
                  <Horaires />
                </ProtectedRoute>
              } />
              <Route path="/planning" element={
                <ProtectedRoute>
                  <Planning />
                </ProtectedRoute>
              } />
              <Route path="/administrateur" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />

              {/* Route 404 */}
              <Route path="/notfound" element={<PageNotFound />} />
              <Route path="*" element={<Navigate to="/notfound" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
