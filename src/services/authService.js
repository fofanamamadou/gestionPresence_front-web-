// src/services/authService.js
// Service d'authentification pour l'intégration avec la nouvelle API backend

import axiosInstance from '../utils/axiosInstance';

class AuthService {
  // ==================== GESTION DES TOKENS ====================
  
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // ==================== GESTION DES DONNÉES UTILISATEUR ====================
  
  getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  // ==================== CONNEXION ADMINISTRATEUR ====================
  
  /**
   * Connexion administrateur via /auth/admin/login/
   * @param {string} email 
   * @param {string} password 
   * @returns {Object} Résultat de la connexion
   */
  async adminLogin(email, password) {
    try {
      const response = await axiosInstance.post('auth/admin/login/', {
        email: email.trim(),
        password
      });

      const { 
        access_token, 
        refresh_token, 
        user_type, 
        permissions, 
        user 
      } = response.data;

      // Stocker les tokens
      this.setTokens(access_token, refresh_token);

      // Stocker les données utilisateur
      const userData = {
        ...user,
        user_type,
        permissions,
        is_admin: true,
        is_superuser: user.is_superuser,
        is_staff: user.is_staff
      };
      this.setUserData(userData);

      return {
        success: true,
        data: {
          user: userData,
          user_type,
          permissions,
          access_token,
          refresh_token
        },
        message: 'Connexion administrateur réussie'
      };

    } catch (error) {
      console.error('Erreur connexion admin:', error);
      
      const errorMessage = error.response?.data?.error || 
                          'Erreur lors de la connexion administrateur';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ==================== DÉCONNEXION ====================
  
  /**
   * Déconnexion via /auth/logout/
   * @returns {Object} Résultat de la déconnexion
   */
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        await axiosInstance.post('auth/logout/', {
          refresh_token: refreshToken
        });
      }

      this.clearTokens();

      return {
        success: true,
        message: 'Déconnexion réussie'
      };

    } catch (error) {
      console.error('Erreur déconnexion:', error);
      
      // Même en cas d'erreur, on nettoie localement
      this.clearTokens();
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la déconnexion',
        localLogout: true // Indique que le nettoyage local a été fait
      };
    }
  }

  // ==================== RAFRAÎCHISSEMENT TOKEN ====================
  
  /**
   * Rafraîchir le token via /auth/refresh/
   * @returns {string|null} Nouveau token d'accès ou null si erreur
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await axiosInstance.post('auth/refresh/', {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      // Mettre à jour les tokens
      this.setTokens(access_token, newRefreshToken);
      
      return access_token;

    } catch (error) {
      console.error('Erreur refresh token:', error);
      this.clearTokens();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  // ==================== PROFIL UTILISATEUR ====================
  
  /**
   * Récupérer le profil utilisateur via /auth/profile/
   * @returns {Object} Données du profil
   */
  async getProfile() {
    try {
      const response = await axiosInstance.get('auth/profile/');
      
      const userData = {
        ...response.data.user,
        user_type: response.data.user_type,
        roles: response.data.roles,
        permissions: response.data.permissions
      };

      // Mettre à jour les données locales
      this.setUserData(userData);

      return {
        success: true,
        data: userData
      };

    } catch (error) {
      console.error('Erreur récupération profil:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération du profil'
      };
    }
  }

  // ==================== CHANGEMENT MOT DE PASSE ====================
  
  /**
   * Changer le mot de passe via /auth/change-password/
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Object} Résultat du changement
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.post('auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      });

      return {
        success: true,
        message: response.data.message || 'Mot de passe modifié avec succès'
      };

    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du changement de mot de passe'
      };
    }
  }

  // ==================== RÉINITIALISATION MOT DE PASSE ====================
  
  /**
   * Demander la réinitialisation du mot de passe via /auth/forgot-password/
   * @param {string} email 
   * @returns {Object} Résultat de la demande
   */
  async forgotPassword(email) {
    try {
      const response = await axiosInstance.post('auth/forgot-password/', {
        email: email.trim()
      });

      return {
        success: true,
        message: response.data.message || 'Un lien de réinitialisation a été envoyé à votre email'
      };

    } catch (error) {
      console.error('Erreur demande réinitialisation:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la demande de réinitialisation'
      };
    }
  }

  /**
   * Réinitialiser le mot de passe via /auth/reset-password/
   * @param {string} uidb64 
   * @param {string} token 
   * @param {string} newPassword 
   * @returns {Object} Résultat de la réinitialisation
   */
  async resetPassword(uidb64, token, newPassword) {
    try {
      const response = await axiosInstance.post('auth/reset-password/', {
        uidb64,
        token,
        new_password: newPassword
      });

      return {
        success: true,
        message: response.data.message || 'Mot de passe réinitialisé avec succès'
      };

    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe'
      };
    }
  }

  // ==================== UTILITAIRES ====================
  
  /**
   * Vérifier si l'utilisateur est administrateur
   * @returns {boolean}
   */
  isAdmin() {
    const userData = this.getUserData();
    return userData?.is_admin || userData?.is_staff || userData?.is_superuser || false;
  }

  /**
   * Vérifier si l'utilisateur est superutilisateur
   * @returns {boolean}
   */
  isSuperuser() {
    const userData = this.getUserData();
    return userData?.is_superuser || false;
  }

  /**
   * Obtenir le type d'utilisateur
   * @returns {string|null}
   */
  getUserType() {
    const userData = this.getUserData();
    return userData?.user_type || null;
  }

  /**
   * Obtenir les rôles de l'utilisateur
   * @returns {Array}
   */
  getUserRoles() {
    const userData = this.getUserData();
    return userData?.roles || [];
  }

  /**
   * Obtenir les permissions de l'utilisateur
   * @returns {Object}
   */
  getUserPermissions() {
    const userData = this.getUserData();
    return userData?.permissions || {};
  }

  /**
   * Vérifier une permission spécifique
   * @param {string} permission 
   * @returns {boolean}
   */
  hasPermission(permission) {
    const permissions = this.getUserPermissions();
    return permissions[permission] || false;
  }
}

export default new AuthService();