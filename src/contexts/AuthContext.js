import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initialisé à true pour le chargement initial
  const [initialized, setInitialized] = useState(false);

  // Initialiser l'état d'authentification au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        if (authService.isAuthenticated()) {
          // Tenter de rafraîchir le profil au démarrage
          try {
            const userData = await refreshUserProfile();
            if (!userData) {
              // Si le rafraîchissement échoue, déconnecter l'utilisateur
              await logout();
            }
          } catch (error) {
            console.error('Error refreshing user profile:', error);
            await logout();
          }
        } else {
          // S'assurer que les tokens sont bien nettoyés si non authentifié
          authService.clearTokens();
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Fonction pour charger les données de l'utilisateur (synchrone)
  const loadUser = () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getUserData();
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    try {
      setLoading(true);
      const result = await authService.getProfile();
      
      if (result.success) {
        setUser(result.data);
        return result.data;
      } else {
        console.error('Error refreshing profile:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, isAdmin = true) => {
    try {
      setLoading(true);
      
      // Appel au service de connexion approprié
      const result = isAdmin 
        ? await authService.adminLogin(email, password)
        : await authService.userLogin(email, password);
      
      if (result.success) {
        // Mettre à jour l'utilisateur avec les données du serveur
        const userData = result.data.user || result.data;
        setUser(userData);
        
        // Retourner le résultat formaté de manière cohérente
        return {
          success: true,
          data: userData,
          message: result.message || 'Connexion réussie'
        };
      } else {
        // En cas d'échec, s'assurer que l'utilisateur est bien déconnecté
        if (result.error?.includes('invalide') || 
            result.error?.includes('désactivé') || 
            result.error?.includes('incorrect')) {
          // Ne pas déconnecter pour les erreurs de connexion normales
        } else {
          // Pour les autres erreurs, nettoyer l'état
          authService.clearTokens();
          setUser(null);
        }
        
        return {
          success: false,
          error: result.error || 'Échec de la connexion. Veuillez réessayer.'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // En cas d'erreur inattendue, nettoyer l'état
      authService.clearTokens();
      setUser(null);
      
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (navigate) => {
    try {
      setLoading(true);
      
      // Tenter de se déconnecter du serveur si possible
      if (authService.isAuthenticated()) {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Erreur lors de la déconnexion du serveur:', error);
          // Continuer quand même avec la déconnexion locale
        }
      }
      
      // Nettoyage local dans tous les cas
      authService.clearTokens();
      setUser(null);
      
      // Rediriger vers la page de connexion si une fonction de navigation est fournie
      if (typeof navigate === 'function') {
        navigate('/login', { replace: true });
      }
      
      return { success: true, message: 'Déconnexion réussie' };
      
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      
      // Forcer la déconnexion locale en cas d'erreur
      authService.clearTokens();
      setUser(null);
      
      // Rediriger vers la page de connexion si une fonction de navigation est fournie
      if (typeof navigate === 'function') {
        navigate('/login', { replace: true });
      }
      
      return { 
        success: false, 
        error: 'Une erreur est survenue lors de la déconnexion',
        localLogout: true
      };
      
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const result = await authService.changePassword(currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors du changement de mot de passe'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    authService.setUserData(userData);
    setUser(userData);
  };

  // Utilitaires pour les permissions
  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  const isAdmin = () => {
    return authService.isAdmin();
  };

  const isSuperuser = () => {
    return authService.isSuperuser();
  };

  const getUserType = () => {
    return authService.getUserType();
  };

  const getUserRoles = () => {
    return authService.getUserRoles();
  };

  const value = {
    // État
    user,
    loading,
    isAuthenticated: !!user,
    
    // Actions d'authentification
    login,
    logout,
    refreshUserProfile,
    changePassword,
    
    // Gestion utilisateur
    updateUser,
    loadUser,
    
    // Utilitaires permissions
    hasPermission,
    isAdmin,
    isSuperuser,
    getUserType,
    getUserRoles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 