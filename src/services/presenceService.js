// src/services/presenceService.js
// Service pour la gestion des présences et pointages

import axiosInstance from '../AxiosInstance/axiosInstance';

class PresenceService {
  // Récupérer toutes les présences
  async getPresences() {
    try {
      const response = await axiosInstance.get('presences/');
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} présences chargées`
      };
    } catch (error) {
      console.error('Erreur lors du chargement des présences:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du chargement des présences'
      };
    }
  }

  // Récupérer les présences avec filtres
  async getPresencesWithFilters(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres comme paramètres de requête
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await axiosInstance.get(`presences/?${params.toString()}`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} présences trouvées`
      };
    } catch (error) {
      console.error('Erreur lors du filtrage des présences:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erreur lors du filtrage des présences'
      };
    }
  }

  // Créer une nouvelle présence/pointage
  async createPresence(presenceData) {
    try {
      const response = await axiosInstance.post('presences/', presenceData);
      return {
        success: true,
        data: response.data,
        message: 'Présence enregistrée avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la présence:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'enregistrement de la présence'
      };
    }
  }

  // Valider une présence (pour les professeurs/admin)
  async validatePresence(presenceId, validationData) {
    try {
      const response = await axiosInstance.post(`validate/`, {
        presence_id: presenceId,
        ...validationData
      });
      return {
        success: true,
        data: response.data,
        message: 'Présence validée avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de la validation de la présence:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la validation de la présence'
      };
    }
  }

  // Exporter les présences en CSV
  exportPresencesToCSV(presences, filename = 'presences.csv') {
    try {
      const headers = ['Date', 'Nom', 'Prénom', 'Email', 'Classe', 'Filière', 'Statut'];
      
      const csvContent = [
        headers.join(','),
        ...presences.map(presence => [
          presence.date || '',
          presence.user?.last_name || '',
          presence.user?.first_name || '',
          presence.user?.email || '',
          presence.user?.classe?.name || '',
          presence.user?.filiere?.name || '',
          presence.status || ''
        ].join(','))
      ].join('\n');

      // Créer et télécharger le fichier CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        message: 'Export CSV réalisé avec succès !'
      };
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'export CSV'
      };
    }
  }
}

export default new PresenceService();
