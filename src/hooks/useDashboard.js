// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dashboardService from '../services/dashboardService';

/**
 * Hook personnalisé pour gérer l'état et la logique du dashboard
 * @returns {Object} État et méthodes du dashboard
 */
const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charge les données du dashboard
   * @param {boolean} isRefresh - Si vrai, affiche un message de rafraîchissement
   */
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await dashboardService.fetchDashboardData();
      
      if (result.success) {
        setData(result.data);
        setError(null);
        setLastUpdated(new Date());
        
        if (isRefresh) {
          message.success('Tableau de bord rafraîchi avec succès');
        }
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      console.error('Erreur dans useDashboard:', err);
      setError(err.message || 'Une erreur est survenue');
      message.error(err.message || 'Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Rafraîchit les données du dashboard
   */
  const refreshData = useCallback(() => {
    loadData(true);
  }, [loadData]);

  /**
   * Exporte les données au format CSV
   */
  const exportData = useCallback(() => {
    if (!data) return;
    
    try {
      const csvContent = dashboardService.exportToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `tableau-de-bord-${dateStr}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Export réussi');
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      message.error('Erreur lors de l\'export des données');
    }
  }, [data]);

  return {
    // État
    loading,
    error,
    data,
    lastUpdated,
    refreshing,
    
    // Méthodes
    refreshData,
    exportData,
  };
};

export default useDashboard;
