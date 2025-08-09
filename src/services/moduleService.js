// src/services/moduleService.js
// Service pour la gestion des modules

import axiosInstance from '../utils/axiosInstance';

class ModuleService {
  // Récupérer tous les modules
  async getModules() {
    try {
      const response = await axiosInstance.get('modules/');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du chargement des modules'
      };
    }
  }
}

export default new ModuleService();
