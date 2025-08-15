// src/services/dashboardService.js
import axiosInstance from '../utils/axiosInstance';

/**
 * @typedef {Object} DashboardKPIs
 * @property {number} attendance_rate - Taux de présence en pourcentage
 * @property {Object} plannings_today - Statistiques des plannings du jour
 * @property {number} plannings_today.total - Nombre total de plannings
 * @property {number} plannings_today.validated - Nombre de plannings validés
 * @property {number} plannings_today.cancelled - Nombre de plannings annulés
 * @property {number} plannings_today.scheduled - Nombre de plannings programmés
 * @property {Object} active_users - Nombre d'utilisateurs actifs
 * @property {number} active_users.students - Nombre d'étudiants actifs
 * @property {number} active_users.professors - Nombre de professeurs actifs
 * @property {number} unjustified_absences_week - Nombre d'absences non justifiées sur la semaine
 */

/**
 * @typedef {Object} ChartData
 * @property {string[]} labels - Étiquettes pour les axes du graphique
 * @property {number[]} data - Données numériques pour le graphique
 */

/**
 * @typedef {Object} DashboardData
 * @property {DashboardKPIs} kpis - Indicateurs clés de performance
 * @property {Object} charts - Données pour les graphiques
 * @property {ChartData} charts.absences_by_filiere - Absences par filière
 * @property {ChartData} charts.absences_by_module - Absences par module
 * @property {ChartData} charts.absences_by_classe - Absences par classe
 */

/**
 * Récupère les données du dashboard depuis l'API
 * @returns {Promise<{success: boolean, data: DashboardData | null, error: string | null}>}
 */
const fetchDashboardData = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/');
    
    // Valider et formater la réponse
    const data = response.data;
    
    if (!data || !data.kpis || !data.charts) {
      throw new Error('Format de réponse invalide depuis le serveur');
    }
    
    return {
      success: true,
      data: {
        kpis: {
          attendance_rate: parseFloat(data.kpis.attendance_rate) || 0,
          plannings_today: {
            total: parseInt(data.kpis.plannings_today?.total, 10) || 0,
            validated: parseInt(data.kpis.plannings_today?.validated, 10) || 0,
            cancelled: parseInt(data.kpis.plannings_today?.cancelled, 10) || 0,
            scheduled: parseInt(data.kpis.plannings_today?.scheduled, 10) || 0,
          },
          active_users: {
            students: parseInt(data.kpis.active_users?.students, 10) || 0,
            professors: parseInt(data.kpis.active_users?.professors, 10) || 0,
          },
          unjustified_absences_week: parseInt(data.kpis.unjustified_absences_week, 10) || 0,
        },
        charts: {
          absences_by_filiere: {
            labels: data.charts.absences_by_filiere?.labels || [],
            data: data.charts.absences_by_filiere?.data?.map(Number) || [],
          },
          absences_by_module: {
            labels: data.charts.absences_by_module?.labels || [],
            data: data.charts.absences_by_module?.data?.map(Number) || [],
          },
          absences_by_classe: {
            labels: data.charts.absences_by_classe?.labels || [],
            data: data.charts.absences_by_classe?.data?.map(Number) || [],
          },
        },
      },
      error: null,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard:', error);
    
    // Gestion d'erreur détaillée
    let errorMessage = 'Erreur lors du chargement du tableau de bord';
    
    if (error.response) {
      // Erreur serveur (4xx, 5xx)
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      // Pas de réponse du serveur
      errorMessage = 'Impossible de se connecter au serveur';
    }
    
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
};

/**
 * Exporte les données du dashboard au format CSV
 * @param {DashboardData} data - Données du dashboard à exporter
 * @returns {string} - Données au format CSV
 */
const exportToCSV = (data) => {
  if (!data) return '';
  
  const rows = [];
  
  // En-tête
  rows.push('Catégorie,Valeur');
  
  // KPIs
  rows.push('\n=== INDICATEURS CLÉS ===');
  rows.push(`Taux de présence,${data.kpis.attendance_rate}%`);
  rows.push('\n=== PLANNINGS AUJOURD\'HUI ===');
  rows.push(`Total,${data.kpis.plannings_today.total}`);
  rows.push(`Validés,${data.kpis.plannings_today.validated}`);
  rows.push(`Annulés,${data.kpis.plannings_today.cancelled}`);
  rows.push(`Programmés,${data.kpis.plannings_today.scheduled}`);
  rows.push('\n=== UTILISATEURS ACTIFS ===');
  rows.push(`Étudiants,${data.kpis.active_users.students}`);
  rows.push(`Professeurs,${data.kpis.active_users.professors}`);
  rows.push(`\nAbsences non justifiées (7j),${data.kpis.unjustified_absences_week}`);
  
  // Données des graphiques
  if (data.charts.absences_by_filiere.labels.length > 0) {
    rows.push('\n=== ABSENCES PAR FILIÈRE ===');
    data.charts.absences_by_filiere.labels.forEach((label, index) => {
      rows.push(`${label},${data.charts.absences_by_filiere.data[index]}`);
    });
  }
  
  if (data.charts.absences_by_module.labels.length > 0) {
    rows.push('\n=== ABSENCES PAR MODULE ===');
    data.charts.absences_by_module.labels.forEach((label, index) => {
      rows.push(`${label},${data.charts.absences_by_module.data[index]}`);
    });
  }
  
  if (data.charts.absences_by_classe.labels.length > 0) {
    rows.push('\n=== ABSENCES PAR CLASSE ===');
    data.charts.absences_by_classe.labels.forEach((label, index) => {
      rows.push(`${label},${data.charts.absences_by_classe.data[index]}`);
    });
  }
  
  return rows.join('\n');
};

export default {
  fetchDashboardData,
  exportToCSV,
};