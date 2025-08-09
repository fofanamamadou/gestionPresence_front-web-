// src/services/filiereService.js
// Service pour la gestion des filières

import axiosInstance from '../utils/axiosInstance';

class FiliereService {
  // Récupérer toutes les filières
  async getFilieres() {
    try {
      const response = await axiosInstance.get('filieres/');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Erreur lors du chargement des filières:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du chargement des filières'
      };
    }
  }
}

export default new FiliereService();
