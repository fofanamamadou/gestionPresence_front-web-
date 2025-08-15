import axiosInstance from '../utils/axiosInstance';

class PlanningService {
  // =================== CRUD BASIQUE ===================
  
  // Récupérer tous les plannings
  async getAllPlannings() {
    try {
      const response = await axiosInstance.get('plannings');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getAllPlannings:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings'
      };
    }
  }

  // Récupérer un planning par ID
  async getPlanningById(id) {
    try {
      const response = await axiosInstance.get(`plannings/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPlanningById:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération du planning'
      };
    }
  }

  // Créer un nouveau planning
  async createPlanning(data) {
    try {
      const response = await axiosInstance.post('plannings', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur createPlanning:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création du planning'
      };
    }
  }

  // Créer plusieurs plannings en une seule fois
  async createMultiplePlannings(planningsArray) {
    try {
      const response = await axiosInstance.post('plannings', planningsArray);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur createMultiplePlannings:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la création des plannings'
      };
    }
  }

  // Mettre à jour un planning existant
  async updatePlanning(id, data) {
    try {
      const response = await axiosInstance.put(`plannings/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur updatePlanning:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour du planning'
      };
    }
  }

  // Supprimer un planning
  async deletePlanning(id) {
    try {
      await axiosInstance.delete(`plannings/${id}`);
      return {
        success: true,
        message: 'Planning supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur deletePlanning:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la suppression du planning'
      };
    }
  }

  // =================== FONCTIONNALITÉS ADMIN SPÉCIFIQUES ===================

  // Valider un cours par l'administrateur
  async validateCoursByAdmin(id) {
    try {
      const response = await axiosInstance.put(`plannings/admin/valider/${id}/`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Cours validé avec succès par l\'administrateur'
      };
    } catch (error) {
      console.error('Erreur validateCoursByAdmin:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la validation administrative du cours'
      };
    }
  }

  // Récupérer les plannings par date (avec paramètre URL)
  async getPlanningsByDate(date) {
    try {
      const response = await axiosInstance.get(`plannings/by-date/?date=${date}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPlanningsByDate:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings par date'
      };
    }
  }

  // Récupérer les plannings par utilisateur
  async getPlanningsByUser(userId) {
    try {
      const response = await axiosInstance.get(`plannings/by-user/${userId}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPlanningsByUser:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings par utilisateur'
      };
    }
  }

  // Récupérer les plannings par module
  async getPlanningsByModule(moduleId) {
    try {
      const response = await axiosInstance.get(`plannings/by-module/${moduleId}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPlanningsByModule:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings par module'
      };
    }
  }

  // Récupérer les plannings validés par les professeurs
  async getValidatedPlanningsByProfessor() {
    try {
      const response = await axiosInstance.get('plannings/validated-by-professor/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getValidatedPlanningsByProfessor:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings validés par les professeurs'
      };
    }
  }

  // Récupérer les plannings en attente de validation admin
  async getPendingPlannings() {
    try {
      const response = await axiosInstance.get('plannings/pending/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPendingPlannings:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings en attente'
      };
    }
  }

  // Récupérer les statistiques des plannings
  async getPlanningStats() {
    try {
      const response = await axiosInstance.get('plannings/stats/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPlanningStats:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des statistiques'
      };
    }
  }

  // Récupérer les plannings d'une période donnée
  async getPlanningsByDateRange(startDate, endDate) {
    try {
      const response = await axiosInstance.get(`plannings/date-range/?start_date=${startDate}&end_date=${endDate}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getPlanningsByDateRange:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings par période'
      };
    }
  }

  // Récupérer les plannings d'aujourd'hui
  async getTodayPlannings() {
    try {
      const response = await axiosInstance.get('plannings/today/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getTodayPlannings:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings d\'aujourd\'hui'
      };
    }
  }

  // Récupérer les plannings de cette semaine
  async getWeekPlannings() {
    try {
      const response = await axiosInstance.get('plannings/week/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur getWeekPlannings:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la récupération des plannings de la semaine'
      };
    }
  }

  // Réinitialiser la validation d'un planning (admin uniquement)
  async resetPlanningValidation(id) {
    try {
      const response = await axiosInstance.put(`plannings/reset/${id}/`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Validation du planning réinitialisée avec succès'
      };
    } catch (error) {
      console.error('Erreur resetPlanningValidation:', error);
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la réinitialisation de la validation'
      };
    }
  }

  // =================== MÉTHODES UTILITAIRES POUR L'INTERFACE ADMIN ===================

  // Formatter les données de planning pour l'affichage
  formatPlanningForDisplay(planning) {
    return {
      id: planning.id,
      professeur: planning.user_details?.first_name + ' ' + planning.user_details?.last_name || 'Non assigné',
      module: planning.module_details?.nom || 'Module non défini',
      date: planning.date,
      horaire: `${planning.horaire_details?.time_start_course} - ${planning.horaire_details?.time_end_course}`,
      salle: planning.horaire_details?.salle || 'Non définie',
      valideProfesseur: planning.is_validated_by_professor,
      valideAdmin: planning.is_validated_by_admin,
      dateCreation: planning.date_creation,
      statut: this.getPlanningStatus(planning)
    };
  }

  // Obtenir le statut d'un planning
  getPlanningStatus(planning) {
    if (planning.is_validated_by_admin) {
      return 'Validé définitivement';
    } else if (planning.is_validated_by_professor) {
      return 'En attente validation admin';
    } else {
      return 'En attente validation professeur';
    }
  }

  // Valider en masse les plannings (pour l'interface admin)
  async validateMultiplePlannings(planningIds) {
    try {
      const results = [];
      for (const id of planningIds) {
        const result = await this.validateCoursByAdmin(id);
        results.push({ id, ...result });
      }
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      return {
        success: errorCount === 0,
        data: results,
        summary: {
          total: planningIds.length,
          success: successCount,
          errors: errorCount
        }
      };
    } catch (error) {
      console.error('Erreur validateMultiplePlannings:', error);
      return {
        success: false,
        error: 'Erreur lors de la validation en masse'
      };
    }
  }

  // Supprimer en masse les plannings
  async deleteMultiplePlannings(planningIds) {
    try {
      const results = [];
      for (const id of planningIds) {
        const result = await this.deletePlanning(id);
        results.push({ id, ...result });
      }
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      return {
        success: errorCount === 0,
        data: results,
        summary: {
          total: planningIds.length,
          success: successCount,
          errors: errorCount
        }
      };
    } catch (error) {
      console.error('Erreur deleteMultiplePlannings:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression en masse'
      };
    }
  }

  // Obtenir un résumé des plannings pour le dashboard admin
  async getDashboardSummary() {
    try {
      const [stats, todayPlannings, pendingPlannings] = await Promise.all([
        this.getPlanningStats(),
        this.getTodayPlannings(),
        this.getPendingPlannings()
      ]);

      if (stats.success && todayPlannings.success && pendingPlannings.success) {
        return {
          success: true,
          data: {
            statistics: stats.data,
            todayCount: todayPlannings.data.length,
            pendingCount: pendingPlannings.data.length,
            urgentValidations: pendingPlannings.data.filter(p => {
              const planningDate = new Date(p.date);
              const today = new Date();
              const diffTime = planningDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 1; // Plannings dans les 24h
            }).length
          }
        };
      }

      return {
        success: false,
        error: 'Erreur lors de la récupération du résumé'
      };
    } catch (error) {
      console.error('Erreur getDashboardSummary:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération du résumé du dashboard'
      };
    }
  }

  // Recherche avancée de plannings (pour l'interface admin)
  async searchPlannings(filters = {}) {
    try {
      let plannings = await this.getAllPlannings();
      
      if (!plannings.success) {
        return plannings;
      }

      let filteredData = plannings.data;

      // Filtrer par professeur
      if (filters.professorId) {
        filteredData = filteredData.filter(p => p.user_details?.id === parseInt(filters.professorId));
      }

      // Filtrer par module
      if (filters.moduleId) {
        filteredData = filteredData.filter(p => p.module_details?.id === parseInt(filters.moduleId));
      }

      // Filtrer par statut de validation
      if (filters.validationStatus) {
        switch (filters.validationStatus) {
          case 'validated_admin':
            filteredData = filteredData.filter(p => p.is_validated_by_admin);
            break;
          case 'pending_admin':
            filteredData = filteredData.filter(p => p.is_validated_by_professor && !p.is_validated_by_admin);
            break;
          case 'pending_professor':
            filteredData = filteredData.filter(p => !p.is_validated_by_professor);
            break;
        }
      }

      // Filtrer par période
      if (filters.startDate && filters.endDate) {
        filteredData = filteredData.filter(p => {
          const pDate = new Date(p.date);
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          return pDate >= start && pDate <= end;
        });
      }

      return {
        success: true,
        data: filteredData
      };
    } catch (error) {
      console.error('Erreur searchPlannings:', error);
      return {
        success: false,
        error: 'Erreur lors de la recherche des plannings'
      };
    }
  }
}

export default new PlanningService();