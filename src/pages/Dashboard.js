import React from 'react';
import { Row, Col, Card, Typography, Button, Space, Spin, Divider, message } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  ScheduleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  TeamOutlined,
  FileExcelOutlined,
  SyncOutlined,
  UserAddOutlined,
  CalendarOutlined,
  BarChartOutlined,
  WarningOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useDashboard from '../hooks/useDashboard';
import KPICard from '../components/dashboard/KPICard';
import DashboardChart from '../components/dashboard/DashboardChart';
import { colors } from '../utils/styles/designTokens';

// Styles constants
const styles = {
  container: {
    padding: '24px 16px',
    backgroundColor: colors.secondary.background,
    minHeight: 'calc(100vh - 64px)' // Adjust based on your header height
  },
  header: {
    marginBottom: 24,
    padding: '16px 24px',
    backgroundColor: colors.secondary.white,
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  card: {
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${colors.secondary.border}`,
    height: '100%'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px 16px',
    backgroundColor: colors.secondary.white,
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    backgroundColor: colors.secondary.white,
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }
};

const { Title, Text } = Typography;

export default function Dashboard() {
  const { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    refreshing, 
    refreshData, 
    exportData 
  } = useDashboard();
  
  const navigate = useNavigate();
  
  // Formater les données pour les graphiques avec gestion des erreurs
  const formatChartData = (labels = [], values = []) => {
    try {
      if (!Array.isArray(labels) || !Array.isArray(values)) {
        console.warn('Les données du graphique ne sont pas des tableaux valides');
        return [];
      }
      
      return labels.map((label, index) => ({
        name: label || `Série ${index + 1}`,
        value: Number(values[index]) || 0
      }));
    } catch (error) {
      console.error('Erreur lors du formatage des données du graphique:', error);
      return [];
    }
  };
  
  // Données pour le graphique des présences/absences avec gestion des erreurs
  const getPresenceData = () => {
    try {
      if (!data?.kpis?.attendance_rate || !data?.kpis?.active_users?.students) {
        console.warn('Données de présence manquantes ou incomplètes');
        return [];
      }
      
      const presentCount = (data.kpis.attendance_rate * data.kpis.active_users.students) / 100;
      const absentCount = data.kpis.active_users.students - presentCount;
      
      return [
        { name: 'Présents', value: Math.round(presentCount) },
        { name: 'Absents', value: Math.round(absentCount) }
      ];
    } catch (error) {
      console.error('Erreur dans getPresenceData:', error);
      return [];
    }
  };
  
  // Données pour le graphique des plannings du jour avec gestion des erreurs
  const getPlanningsData = () => {
    try {
      if (!data?.kpis?.plannings_today) {
        console.warn('Données des plannings manquantes');
        return [];
      }
      
      const { validated = 0, cancelled = 0, scheduled = 0 } = data.kpis.plannings_today;
      return [
        { name: 'Validés', value: validated },
        { name: 'Annulés', value: cancelled },
        { name: 'Programmés', value: scheduled }
      ];
    } catch (error) {
      console.error('Erreur dans getPlanningsData:', error);
      return [];
    }
  };
  
  // Vérifier si les données nécessaires sont disponibles
  const hasChartData = (chartKey) => {
    try {
      if (!data?.charts?.[chartKey]) return false;
      const chartData = data.charts[chartKey];
      return Array.isArray(chartData.labels) && 
             Array.isArray(chartData.data) && 
             chartData.labels.length > 0 && 
             chartData.data.length > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification des données du graphique ${chartKey}:`, error);
      return false;
    }
  };

  // Rendu du composant
  if (loading && !data) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <Title level={3} style={{ color: colors.status.error, marginBottom: 16 }}>
          <WarningOutlined style={{ marginRight: 8 }} />
          Erreur lors du chargement du tableau de bord
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {error.message || 'Une erreur inattendue est survenue'}
        </Text>
        <Button 
          type="primary" 
          icon={<SyncOutlined />} 
          onClick={refreshData}
          loading={refreshing}
          style={{
            backgroundColor: colors.primary.main,
            borderColor: colors.primary.main
          }}
        >
          Réessayer
        </Button>
      </div>
    );
  }
  
  // Vérifier si les données sont vides
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={styles.errorContainer}>
        <Title level={3} style={{ color: colors.status.warning, marginBottom: 16 }}>
          <WarningOutlined style={{ marginRight: 8 }} />
          Aucune donnée disponible
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Le tableau de bord ne contient aucune donnée à afficher pour le moment.
        </Text>
        <Button 
          type="primary" 
          icon={<SyncOutlined />} 
          onClick={refreshData}
          loading={refreshing}
          style={{
            backgroundColor: colors.primary.main,
            borderColor: colors.primary.main
          }}
        >
          Actualiser
        </Button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* En-tête avec titre et actions */}
      <div style={styles.header}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, color: colors.primary.dark, fontWeight: 600 }}>
              Tableau de bord
            </Title>
            {lastUpdated && (
              <Text type="secondary" style={{ fontSize: 12, color: colors.text.secondary }}>
                Mis à jour à {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<FileExcelOutlined />} 
                onClick={exportData}
                disabled={!data || refreshing}
                style={{
                  color: colors.primary.main,
                  borderColor: colors.primary.main
                }}
              >
                Exporter
              </Button>
              <Button 
                type="primary" 
                icon={<SyncOutlined spin={refreshing} />} 
                onClick={refreshData}
                loading={refreshing}
                style={{
                  backgroundColor: colors.primary.main,
                  borderColor: colors.primary.main
                }}
              >
                Actualiser
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Section KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Taux de présence"
            value={data?.kpis?.attendance_rate ?? 0}
            suffix="%"
            tooltip="Pourcentage d'étudiants présents aujourd'hui"
            prefix={<CheckCircleOutlined style={{ color: colors.status.success }} />}
            loading={loading || refreshing}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Étudiants actifs"
            value={data?.kpis?.active_users?.students ?? 0}
            tooltip="Nombre total d'étudiants actifs"
            prefix={<TeamOutlined style={{ color: colors.roles.student }} />}
            loading={loading || refreshing}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Professeurs actifs"
            value={data?.kpis?.active_users?.professors ?? 0}
            tooltip="Nombre total de professeurs actifs"
            prefix={<UserOutlined style={{ color: colors.roles.teacher }} />}
            loading={loading || refreshing}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Absences non justifiées (7j)"
            value={data?.kpis?.unjustified_absences_week ?? 0}
            tooltip="Nombre d'absences non justifiées sur les 7 derniers jours"
            prefix={<CloseCircleOutlined style={{ color: colors.status.error }} />}
            loading={loading || refreshing}
          />
        </Col>
      </Row>

      {/* Section Actions rapides */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <ScheduleOutlined style={{ color: colors.primary.main }} />
                <span>Actions rapides</span>
              </Space>
            }
            bordered={false}
            style={styles.card}
            headStyle={{
              borderBottom: `1px solid ${colors.secondary.border}`,
              fontWeight: 500
            }}
          >
            <Space wrap>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={() => navigate('/etudiants/ajouter')}
                style={{
                  backgroundColor: colors.roles.student,
                  borderColor: colors.roles.student
                }}
              >
                Ajouter un étudiant
              </Button>
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => navigate('/plannings/creer')}
                style={{
                  color: colors.primary.main,
                  borderColor: colors.primary.main
                }}
              >
                Créer un planning
              </Button>
              <Button 
                icon={<BarChartOutlined />}
                onClick={() => navigate('/rapports')}
                style={{
                  color: colors.roles.teacher,
                  borderColor: colors.roles.teacher
                }}
              >
                Générer un rapport
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Section Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            style={styles.card}
            loading={loading || refreshing}
            title={
              <Space>
                <PieChartOutlined style={{ color: colors.status.success }} />
                <span>Répartition des présences</span>
              </Space>
            }
          >
            {getPresenceData().length > 0 ? (
              <div style={{ height: '300px' }}>
                <DashboardChart
                  data={getPresenceData()}
                  type="pie"
                  loading={loading || refreshing}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: colors.text.secondary
              }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Aucune donnée de présence disponible
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            style={styles.card}
            loading={loading || refreshing}
            title={
              <Space>
                <CalendarOutlined style={{ color: colors.primary.main }} />
                <span>Plannings du jour</span>
              </Space>
            }
          >
            {getPlanningsData().length > 0 ? (
              <div style={{ height: '300px' }}>
                <DashboardChart
                  data={getPlanningsData()}
                  type="pie"
                  loading={loading || refreshing}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: colors.text.secondary
              }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Aucun planning pour aujourd'hui
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Section Graphiques d'absences */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card 
            style={styles.card}
            loading={loading || refreshing}
            title={
              <Space>
                <BarChartOutlined style={{ color: colors.primary.main }} />
                <span>Absences par filière</span>
              </Space>
            }
          >
            {hasChartData('absences_by_filiere') ? (
              <div style={{ height: '300px' }}>
                <DashboardChart
                  data={formatChartData(
                    data.charts.absences_by_filiere.labels,
                    data.charts.absences_by_filiere.data
                  )}
                  type="bar"
                  loading={loading || refreshing}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: colors.text.secondary
              }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Aucune donnée disponible
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            style={styles.card}
            loading={loading || refreshing}
            title={
              <Space>
                <BarChartOutlined style={{ color: colors.primary.main }} />
                <span>Absences par module</span>
              </Space>
            }
          >
            {hasChartData('absences_by_module') ? (
              <div style={{ height: '300px' }}>
                <DashboardChart
                  data={formatChartData(
                    data.charts.absences_by_module.labels,
                    data.charts.absences_by_module.data
                  )}
                  type="bar"
                  loading={loading || refreshing}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: colors.text.secondary
              }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Aucune donnée disponible
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            style={styles.card}
            loading={loading || refreshing}
            title={
              <Space>
                <BarChartOutlined style={{ color: colors.primary.main }} />
                <span>Absences par classe</span>
              </Space>
            }
          >
            {hasChartData('absences_by_classe') ? (
              <div style={{ height: '300px' }}>
                <DashboardChart
                  data={formatChartData(
                    data.charts.absences_by_classe.labels,
                    data.charts.absences_by_classe.data
                  )}
                  type="bar"
                  loading={loading || refreshing}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: colors.text.secondary
              }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Aucune donnée disponible
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Pied de page */}
      <Divider style={{ margin: '24px 0', borderColor: colors.secondary.border }} />
      <div style={{ 
        textAlign: 'center', 
        marginTop: 16,
        padding: '12px',
        backgroundColor: colors.secondary.white,
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Text type="secondary" style={{ color: colors.text.secondary }}>
          Dernière mise à jour: {new Date().toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </Text>
      </div>
    </div>
  );
}
