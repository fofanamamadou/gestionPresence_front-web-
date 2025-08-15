// src/App.js
import 'antd/dist/reset.css';
import { Layout, theme, ConfigProvider } from 'antd';
import { colors } from './utils/styles/designTokens';
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
import ResetPassword from './pages/ResetPassword';
import PageNotFound from './pages/Error';
import Admin from './pages/Admin';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Pendant le chargement initial, ne rien afficher
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    // Stocker l'URL de redirection après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Pendant le chargement initial, ne rien afficher
  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    // Rediriger vers la page d'accueil ou la page demandée avant la connexion
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

const AppContent = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const isAuthPage = ["/login", "/forgot-password", "/reset-password", "/notfound"].includes(location.pathname);
  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  // Style du contenu principal
  const contentStyle = {
    minHeight: '100vh',
    backgroundColor: colors.secondary.background,
    transition: 'all 0.2s',
  };

  // Style du contenu de la page
  const pageContentStyle = {
    marginLeft: isAuthenticated && !isAuthPage 
      ? (isSidebarCollapsed ? '80px' : '250px') 
      : '0',
    padding: isAuthenticated && !isAuthPage ? '80px 24px 24px' : '0',
    minHeight: '100vh',
    transition: 'all 0.2s',
    backgroundColor: colors.secondary.background,
  };

  return (
    <ErrorBoundary>
      <Layout style={contentStyle}>
        {isAuthenticated && !isAuthPage && (
          <>
            <Header collapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
            <Sidebar collapsed={isSidebarCollapsed} onCollapse={toggleSidebar} />
          </>
        )}

        <Layout style={pageContentStyle}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
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
                <Route path="/reset-password/:uidb64/:token" element={
                  <PublicRoute>
                    <ResetPassword />
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
        </Layout>
      </Layout>
    </ErrorBoundary>

  );
};

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary.main,
          colorSuccess: colors.status.success,
          colorWarning: colors.status.warning,
          colorError: colors.status.error,
          colorInfo: colors.status.info,
          colorLink: colors.primary.main,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: colors.secondary.white,
            headerPadding: '0 24px',
            headerHeight: 64,
            siderBg: colors.primary.dark,
          },
          Menu: {
            darkItemBg: colors.primary.dark,
            darkItemColor: 'rgba(255, 255, 255, 0.65)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.1)',
            darkItemSelectedBg: colors.primary.highlight,
            darkItemSelectedColor: colors.text.white,
            itemHeight: 48,
            itemMarginInline: 0,
            itemMarginBlock: 0,
            itemBorderRadius: 0,
          },
          Button: {
            primaryColor: colors.text.white,
          },
        },
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
}
