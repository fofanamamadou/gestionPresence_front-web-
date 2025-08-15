import axiosInstance from '../utils/axiosInstance';

class FiliereService {
  // Récupérer toutes les filières
  async getAllFilieres() {
    try {
      const response = await axiosInstance.get('filieres/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erreur getAllFilieres:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des filières',
      };
    }
  }

  // Récupérer une filière par ID
  async getFiliereById(id) {
    try {
      const response = await axiosInstance.get(`filieres/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erreur getFiliereById:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération de la filière',
      };
    }
  }

  // Créer une nouvelle filière
  async createFiliere(data) {
    try {
      const response = await axiosInstance.post('filieres/', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erreur createFiliere:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création de la filière',
      };
    }
  }

  // Mettre à jour une filière existante
  async updateFiliere(id, data) {
    try {
      const response = await axiosInstance.put(`filieres/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erreur updateFiliere:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour de la filière',
      };
    }
  }

  // Supprimer une filière
  async deleteFiliere(id) {
    try {
      const response = await axiosInstance.delete(`filieres/${id}`);
      return {
        success: true,
        message: response.data.message || 'Filière supprimée avec succès',
      };
    } catch (error) {
      console.error('Erreur deleteFiliere:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la suppression de la filière',
      };
    }
  }
}

export default new FiliereService();
