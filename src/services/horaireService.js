import axiosInstance from '../utils/axiosInstance';

class HoraireService {
  // Récupérer tous les horaires
  async getAllHoraires() {
    try {
      const response = await axiosInstance.get('horaires');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getAllHoraires:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des horaires'
      };
    }
  }

  // Récupérer un horaire par ID
  async getHoraireById(id) {
    try {
      const response = await axiosInstance.get(`horaires/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getHoraireById:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération de l\'horaire'
      };
    }
  }

  // Créer un nouvel horaire
  async createHoraire(data) {
    try {
      const response = await axiosInstance.post('horaires', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur createHoraire:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création de l\'horaire'
      };
    }
  }

  // Mettre à jour un horaire existant
  async updateHoraire(id, data) {
    try {
      const response = await axiosInstance.put(`horaires/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur updateHoraire:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour de l\'horaire'
      };
    }
  }

  // Supprimer un horaire
  async deleteHoraire(id) {
    try {
      await axiosInstance.delete(`horaires/${id}`);
      return {
        success: true,
        message: 'Horaire supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur deleteHoraire:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la suppression de l\'horaire'
      };
    }
  }

  // Récupérer les horaires d'un module spécifique
  async getHorairesByModule(moduleId) {
    try {
      const response = await axiosInstance.get(`horaires/module/${moduleId}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getHorairesByModule:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des horaires du module'
      };
    }
  }

  // Récupérer les horaires d'un professeur pour un jour donné
  async getHorairesProfesseur(jour) {
    try {
      const response = await axiosInstance.get(`horaires/professeur/`, {
        params: { jour }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getHorairesProfesseur:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des horaires du professeur'
      };
    }
  }

  // Récupérer les horaires d'un étudiant pour un jour donné
  async getHorairesEtudiant(jour) {
    try {
      const response = await axiosInstance.get(`horaires/etudiant/`, {
        params: { jour }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getHorairesEtudiant:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des horaires de l\'étudiant'
      };
    }
  }

  // Méthode utilitaire pour récupérer les horaires de la semaine d'un professeur
  async getHorairesSemaineProfesseur() {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const horairesParJour = {};
    
    try {
      for (const jour of jours) {
        const result = await this.getHorairesProfesseur(jour);
        if (result.success) {
          horairesParJour[jour] = result.data;
        } else {
          horairesParJour[jour] = [];
        }
      }
      
      return {
        success: true,
        data: horairesParJour
      };
    } catch (error) {
      console.error('Erreur getHorairesSemaineProfesseur:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des horaires de la semaine'
      };
    }
  }

  // Méthode utilitaire pour récupérer les horaires de la semaine d'un étudiant
  async getHorairesSemaineEtudiant() {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const horairesParJour = {};
    
    try {
      for (const jour of jours) {
        const result = await this.getHorairesEtudiant(jour);
        if (result.success) {
          horairesParJour[jour] = result.data;
        } else {
          horairesParJour[jour] = [];
        }
      }
      
      return {
        success: true,
        data: horairesParJour
      };
    } catch (error) {
      console.error('Erreur getHorairesSemaineEtudiant:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des horaires de la semaine'
      };
    }
  }
}

export default new HoraireService();