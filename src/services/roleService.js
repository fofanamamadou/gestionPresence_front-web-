// src/services/roleService.js
// Service pour la gestion des rôles

import axiosInstance from '../utils/axiosInstance';

class RoleService {
  // Récupérer tous les rôles
  async getAllRoles() {
    try {
      const response = await axiosInstance.get('roles/');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du chargement des rôles'
      };
    }
  }
}

export default new RoleService();
