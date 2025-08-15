import axiosInstance from '../utils/axiosInstance';

class ModuleService {
  // Récupérer tous les modules
  async getAllModules() {
    try {
      const response = await axiosInstance.get('modules/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getAllModules:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des modules'
      };
    }
  }

  // Récupérer un module par ID
  async getModuleById(id) {
    try {
      const response = await axiosInstance.get(`modules/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getModuleById:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération du module'
      };
    }
  }

  // Créer un nouveau module
  async createModule(data) {
    try {
      const response = await axiosInstance.post('modules/', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur createModule:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création du module'
      };
    }
  }

  // Mettre à jour un module existant
  async updateModule(id, data) {
    try {
      const response = await axiosInstance.put(`modules/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur updateModule:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour du module'
      };
    }
  }

  // Supprimer un module
  async deleteModule(id) {
    try {
      await axiosInstance.delete(`modules/${id}`);
      return {
        success: true,
        message: 'Module supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur deleteModule:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la suppression du module'
      };
    }
  }

  // Récupérer les modules d'un professeur par son ID
  async getProfessorModules(professorId) {
    try {
      const response = await axiosInstance.get(`professeurs/${professorId}/modules/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getProfessorModules:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des modules du professeur'
      };
    }
  }
}

export default new ModuleService();