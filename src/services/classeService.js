import axiosInstance from '../utils/axiosInstance';

class ClasseService {
  // Récupérer toutes les classes
  async getAllClasses() {
    try {
      const response = await axiosInstance.get('classes');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getAllClasses:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des classes'
      };
    }
  }

  // Récupérer une classe par ID
  async getClasseById(id) {
    try {
      const response = await axiosInstance.get(`classes/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getClasseById:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération de la classe'
      };
    }
  }

  // Créer une nouvelle classe
  async createClasse(data) {
    try {
      const response = await axiosInstance.post('classes', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur createClasse:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création de la classe'
      };
    }
  }

  // Mettre à jour une classe existante
  async updateClasse(id, data) {
    try {
      const response = await axiosInstance.put(`classes/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur updateClasse:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour de la classe'
      };
    }
  }

  // Supprimer une classe
  async deleteClasse(id) {
    try {
      await axiosInstance.delete(`classes/${id}`);
      return {
        success: true,
        message: 'Classe supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur deleteClasse:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la suppression de la classe'
      };
    }
  }
}

export default new ClasseService();
