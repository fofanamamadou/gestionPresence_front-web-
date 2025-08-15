import axiosInstance from '../utils/axiosInstance';

class UserService {
  // Récupérer tous les utilisateurs (non-admins)
  async getAllUsers() {
    try {
      const response = await axiosInstance.get('users');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getAllUsers:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(id) {
    try {
      const response = await axiosInstance.get(`users/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getUserById:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération de l\'utilisateur'
      };
    }
  }

  // Créer un nouvel utilisateur
  async createUser(data) {
    try {
      const response = await axiosInstance.post('users', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur createUser:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création de l\'utilisateur'
      };
    }
  }

  // Mettre à jour un utilisateur existant
  async updateUser(id, data) {
    try {
      const response = await axiosInstance.put(`users/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur updateUser:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour de l\'utilisateur'
      };
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id) {
    try {
      await axiosInstance.delete(`users/${id}`);
      return {
        success: true,
        message: 'Utilisateur supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur deleteUser:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la suppression de l\'utilisateur'
      };
    }
  }

  // Récupérer la liste des étudiants
  async getStudents() {
    try {
      const response = await axiosInstance.get('users/students');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getStudents:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des étudiants'
      };
    }
  }

  // Récupérer la liste des professeurs
  async getProfessors() {
    try {
      const response = await axiosInstance.get('users/professors');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getProfessors:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des professeurs'
      };
    }
  }

  // Désactiver/Activer un utilisateur
  async toggleUserStatus(userId) {
    try {
      const response = await axiosInstance.put(`users/${userId}/disable`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Statut de l\'utilisateur modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur toggleUserStatus:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la modification du statut de l\'utilisateur'
      };
    }
  }
}

export default new UserService();