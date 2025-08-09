// src/services/classService.js
// Service pour la gestion des classes

import axiosInstance from '../utils/axiosInstance';

class ClassService {
  // Récupérer toutes les classes
  async getClasses() {
    try {
      const response = await axiosInstance.get('classes/');
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} classes chargées`
      };
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du chargement des classes'
      };
    }
  }

  // Créer une nouvelle classe
  async createClass(classData) {
    try {
      const response = await axiosInstance.post('classes/', classData);
      return {
        success: true,
        data: response.data,
        message: 'Classe créée avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la classe'
      };
    }
  }

  // Mettre à jour une classe
  async updateClass(id, classData) {
    try {
      const response = await axiosInstance.put(`classes/${id}/`, classData);
      return {
        success: true,
        data: response.data,
        message: 'Classe modifiée avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la modification de la classe:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la modification de la classe'
      };
    }
  }

  // Supprimer une classe
  async deleteClass(id) {
    try {
      await axiosInstance.delete(`classes/${id}/`);
      return {
        success: true,
        message: 'Classe supprimée avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression de la classe'
      };
    }
  }
}

export default new ClassService();
