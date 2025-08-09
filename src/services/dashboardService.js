// src/services/dashboardService.js
// Service pour les statistiques du dashboard

import axiosInstance from '../AxiosInstance/axiosInstance';

class DashboardService {
  // Récupérer les statistiques générales
  async getStats() {
    try {
      const [
        studentsResult,
        professorsResult,
        personnelsResult,
        classesResult,
        modulesResult,
        presencesResult,
        absencesResult
      ] = await Promise.all([
        axiosInstance.get('users/?role=student'),
        axiosInstance.get('users/?role=professor'),
        axiosInstance.get('users/?role=personnel'),
        axiosInstance.get('classes/'),
        axiosInstance.get('modules/'),
        axiosInstance.get('presences/?status=present'),
        axiosInstance.get('presences/?status=absent')
      ]);

      return {
        success: true,
        data: {
          students: studentsResult.data || [],
          professors: professorsResult.data || [],
          personnels: personnelsResult.data || [],
          classes: classesResult.data || [],
          modules: modulesResult.data || [],
          presences: presencesResult.data || [],
          absences: absencesResult.data || []
        }
      };
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des statistiques'
      };
    }
  }

  // Récupérer les données pour les graphiques
  async getChartData() {
    try {
      const statsResult = await this.getStats();
      if (!statsResult.success) {
        return statsResult;
      }

      const { students, professors, personnels, classes, modules, presences, absences } = statsResult.data;

      // Données pour le graphique en secteurs
      const pieData = [
        { name: "Étudiants", value: students.length, fill: "#8884d8" },
        { name: "Professeurs", value: professors.length, fill: "#82ca9d" },
        { name: "Personnels", value: personnels.length, fill: "#ffc658" },
        { name: "Classes", value: classes.length, fill: "#0088FE" },
        { name: "Modules", value: modules.length, fill: "#00C49F" },
        { name: "Absents", value: absences.length, fill: "#A020F0" }
      ];

      // Données pour le graphique en barres (exemple)
      const barData = [
        { name: "Présents", value: presences.length },
        { name: "Absents", value: absences.length }
      ];

      return {
        success: true,
        data: {
          pieData,
          barData,
          stats: {
            totalStudents: students.length,
            totalProfessors: professors.length,
            totalPersonnels: personnels.length,
            totalClasses: classes.length,
            totalModules: modules.length,
            totalPresences: presences.length,
            totalAbsences: absences.length
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors de la génération des données graphiques:', error);
      return {
        success: false,
        error: 'Erreur lors de la génération des données graphiques'
      };
    }
  }
}

export default new DashboardService();
