// src/services/userService.js
// Service pour la gestion des utilisateurs

import axiosInstance, { postForm, putForm } from '../utils/axiosInstance';

class UserService {
  // Récupérer tous les utilisateurs
  async getUsers() {
    try {
      const response = await axiosInstance.get('users/');
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} utilisateurs chargés`
      };
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du chargement des utilisateurs'
      };
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(id) {
    try {
      const response = await axiosInstance.get(`users/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Utilisateur non trouvé'
      };
    }
  }

  // Créer un nouvel utilisateur
  async createUser(userData, photo = null) {
    try {
      let response;
      
      // Si c'est un étudiant avec photo, utiliser FormData
      if (userData.roles && this._isStudent(userData.roles) && photo) {
        const formData = new FormData();
        
        // Ajouter les données utilisateur
        Object.entries(userData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => formData.append(`${key}[]`, v));
          } else {
            formData.append(key, value ?? "");
          }
        });
        
        // Ajouter la photo
        formData.append("photo", photo);
        
        response = await postForm("users/", formData);
      } else {
        // Sinon, envoi JSON classique
        response = await axiosInstance.post("users/", userData);
      }

      return {
        success: true,
        data: response.data,
        message: 'Utilisateur créé avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur'
      };
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id, userData, photo = null) {
    try {
      let response;
      
      // Si c'est un étudiant avec photo, utiliser FormData
      if (userData.roles && this._isStudent(userData.roles) && photo) {
        const formData = new FormData();
        
        // Ajouter les données utilisateur
        Object.entries(userData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => formData.append(`${key}[]`, v));
          } else {
            formData.append(key, value ?? "");
          }
        });
        
        // Ajouter la photo
        formData.append("photo", photo);
        
        response = await putForm(`users/${id}/`, formData);
      } else {
        // Sinon, envoi JSON classique
        response = await axiosInstance.put(`users/${id}/`, userData);
      }

      return {
        success: true,
        data: response.data,
        message: 'Utilisateur modifié avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la modification de l\'utilisateur'
      };
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id) {
    try {
      await axiosInstance.delete(`users/${id}/`);
      return {
        success: true,
        message: 'Utilisateur supprimé avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur'
      };
    }
  }

  // Activer/Désactiver un utilisateur
  async toggleUserStatus(id) {
    try {
      const response = await axiosInstance.put(`users/${id}/disable/`);
      return {
        success: true,
        message: response.data.message || 'Statut modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la modification du statut'
      };
    }
  }

  // Méthode utilitaire pour vérifier si le rôle est étudiant
  _isStudent(roles) {
    if (Array.isArray(roles)) {
      return roles.some(role => 
        typeof role === 'string' ? role.toLowerCase() === 'student' : role.name?.toLowerCase() === 'student'
      );
    }
    return typeof roles === 'string' ? roles.toLowerCase() === 'student' : roles?.name?.toLowerCase() === 'student';
  }
}

export default new UserService();
