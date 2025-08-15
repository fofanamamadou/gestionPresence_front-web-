import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  message, 
  Spin, 
  Table, 
  Popconfirm, 
  DatePicker, 
  InputNumber, 
  Tag, 
  Space, 
  Card, 
  Statistic, 
  Row, 
  Col,
  Tooltip,
  Alert
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

import PlanningService from "../services/planningService";
import { styles, colors, typography, spacing, borderRadius, shadows } from "../utils/styles/designTokens";
import UserService from "../services/userService";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Planning = () => {
  // États principaux
  const [plannings, setPlannings] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [horaires, setHoraires] = useState([]);
  const [stats, setStats] = useState({});
  
  // États de chargement
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingHoraires, setLoadingHoraires] = useState(false);

  // États modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // États filtres
  const [filters, setFilters] = useState({
    search: "",
    professeur: null,
    validationStatus: null,
    dateRange: null
  });

  const [form] = Form.useForm();

  // Charger les données initiales
  useEffect(() => {
    fetchPlannings();
    fetchProfesseurs();
    fetchStats();
  }, []);

  // Charger les plannings
  const fetchPlannings = async () => {
    setLoadingList(true);
    try {
      const res = await PlanningService.getAllPlannings();
      if (res.success) {
        setPlannings(res.data);
      } else {
        message.error(res.error || "Erreur lors du chargement des plannings");
      }
    } catch {
      message.error("Erreur serveur lors du chargement");
    }
    setLoadingList(false);
  };

  // Charger les professeurs
  const fetchProfesseurs = async () => {
    try {
      const res = await UserService.getProfessors();
      if (res.success) {
        setProfesseurs(res.data);
      } else {
        message.error(res.error || "Erreur lors du chargement des plannings");
      }
    } catch (error) {
      message.error("Erreur lors du chargement des professeurs:", error);
    }
  };

  // Charger les statistiques
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await PlanningService.getPlanningStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
    setLoadingStats(false);
  };


  // Filtrer les plannings
  const getFilteredPlannings = () => {
    return plannings.filter((planning) => {
      const fullName = `${planning.user_details?.first_name || ""} ${planning.user_details?.last_name || ""}`.toLowerCase();
      const moduleName = planning.module_details?.name?.toLowerCase() || "";
      
      // Filtre recherche
      const searchMatch = !filters.search || 
        fullName.includes(filters.search.toLowerCase()) || 
        moduleName.includes(filters.search.toLowerCase());

      // Filtre professeur
      const profMatch = !filters.professeur || planning.user === filters.professeur;

      // Filtre module
      const moduleMatch = !filters.module || planning.horaire_details?.module === filters.module;

      // Filtre validation
      let validationMatch = true;
      if (filters.validationStatus) {
        switch (filters.validationStatus) {
          case 'pending_admin':
            validationMatch = planning.is_validated_by_professor && !planning.is_validated_by_admin;
            break;
          case 'validated_admin':
            validationMatch = planning.is_validated_by_admin;
            break;
          case 'pending_professor':
            validationMatch = !planning.is_validated_by_professor;
            break;
          default:
            validationMatch = true;
        }
      }

      // Filtre date
      let dateMatch = true;
      if (filters.dateRange && filters.dateRange.length === 2) {
        const planningDate = dayjs(planning.date);
        dateMatch = planningDate.isAfter(filters.dateRange[0]) && 
                   planningDate.isBefore(filters.dateRange[1]);
      }

      return searchMatch && profMatch && moduleMatch && validationMatch && dateMatch;
    });
  };

  // Ouvrir modal ajout
  const openModal = () => {
    setIsModalOpen(true);
    setEditMode(false);
    setEditId(null);
    form.resetFields();
  };

  // Ouvrir modal modification
  const openEditModal = (record) => {
    setIsModalOpen(true);
    setEditMode(true);
    setEditId(record.id);
    form.setFieldsValue({
      user: record.user,
      horaire: record.horaire,
      date: dayjs(record.date),
      duration: 1
    });
    

    
    
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    form.resetFields();
    setHoraires([]);
  };

  // Soumettre le formulaire
  const handleSubmit = async (values) => {
    setLoadingSubmit(true);
    try {
      const planningData = {
        ...values,
        date: values.date.format('YYYY-MM-DD')
      };

      let res;
      if (editMode) {
        res = await PlanningService.updatePlanning(editId, planningData);
      } else {
        // Générer plusieurs plannings si duration > 1
        if (values.duration > 1) {
          const selectedHoraire = horaires.find(h => h.id === values.horaire);
          const dates = generateCourseDates(values.date, selectedHoraire?.jours, values.duration);
          
          const planningsArray = dates.map(date => ({
            ...planningData,
            date: date
          }));
          
          res = await PlanningService.createMultiplePlannings(planningsArray);
        } else {
          res = await PlanningService.createPlanning(planningData);
        }
      }

      if (res.success) {
        message.success(editMode ? "Planning modifié avec succès !" : "Planning(s) ajouté(s) avec succès !");
        closeModal();
        fetchPlannings();
        fetchStats();
      } else {
        message.error(res.error || "Erreur lors de l'opération");
      }
    } catch {
      message.error("Erreur serveur");
    }
    setLoadingSubmit(false);
  };

  // Générer les dates pour plusieurs semaines
  const generateCourseDates = (startDate, selectedDay, numberOfWeeks) => {
    const dates = [];
    const startMoment = dayjs(startDate);
    
    const dayNumbers = {
      'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4,
      'Vendredi': 5, 'Samedi': 6, 'Dimanche': 0
    };
    
    let nextDate = startMoment.day(dayNumbers[selectedDay]);
    if (nextDate.isBefore(startMoment)) {
      nextDate = nextDate.add(1, 'week');
    }

    for (let i = 0; i < numberOfWeeks; i++) {
      dates.push(nextDate.add(i, 'week').format('YYYY-MM-DD'));
    }

    return dates;
  };

  // Supprimer un planning
  const deletePlanning = async (id) => {
    setLoadingList(true);
    try {
      const res = await PlanningService.deletePlanning(id);
      if (res.success) {
        message.success("Planning supprimé avec succès !");
        fetchPlannings();
        fetchStats();
      } else {
        message.error(res.error || "Erreur lors de la suppression");
      }
    } catch {
      message.error("Erreur serveur");
    }
    setLoadingList(false);
  };

  // Valider un cours (admin)
  const validateCours = async (id) => {
    try {
      const res = await PlanningService.validateCoursByAdmin(id);
      if (res.success) {
        message.success("Cours validé avec succès !");
        fetchPlannings();
        fetchStats();
      } else {
        message.error(res.error || "Erreur lors de la validation");
      }
    } catch {
      message.error("Erreur serveur");
    }
  };

  // Réinitialiser la validation
  const resetValidation = async (id) => {
    try {
      const res = await PlanningService.resetPlanningValidation(id);
      if (res.success) {
        message.success("Validation réinitialisée avec succès !");
        fetchPlannings();
        fetchStats();
      } else {
        message.error(res.error || "Erreur lors de la réinitialisation");
      }
    } catch {
      message.error("Erreur serveur");
    }
  };

  // Exporter en CSV
  const exportToCSV = async () => {
    try {
      const filteredData = getFilteredPlannings();
      const headers = ["Professeur", "Module", "Date", "Heure Début", "Heure Fin", "Salle", "Statut Professeur", "Statut Admin"];
      
      const rows = filteredData.map(planning => [
        planning.user_details ? `${planning.user_details.first_name} ${planning.user_details.last_name}` : "Non assigné",
        planning.module_details?.name || "Non défini",
        dayjs(planning.date).format('DD/MM/YYYY'),
        planning.horaire_details?.time_start_course?.slice(0, 5) || "",
        planning.horaire_details?.time_end_course?.slice(0, 5) || "",
        planning.horaire_details?.salle || "",
        planning.is_validated_by_professor ? "Validé" : "Non validé",
        planning.is_validated_by_admin ? "Validé" : "Non validé"
      ]);
    
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n");
    
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `planning_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success("Export CSV réalisé avec succès !");
    } catch (error) {
      message.error("Erreur lors de l'export CSV");
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      search: "",
      professeur: null,
      validationStatus: null,
      dateRange: null
    });
  };

  // Rendu du statut de validation
  const renderValidationStatus = (planning) => {
    if (planning.is_validated_by_admin) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Validé Admin
        </Tag>
      );
    }
    
    if (planning.is_validated_by_professor) {
      return (
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          En attente Admin
        </Tag>
      );
    }
    
    return (
      <Tag color="error" icon={<ExclamationCircleOutlined />}>
        Non effectué
      </Tag>
    );
  };

  // Rendu des actions
  const renderActions = (_, record) => {
    const actions = [];

    // Bouton voir détails
    actions.push(
      <Tooltip title="Voir les détails" key="view">
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => openEditModal(record)}
        />
      </Tooltip>
    );

    // Bouton modifier (si pas validé par le prof)
    if (!record.is_validated_by_professor) {
      actions.push(
        <Tooltip title="Modifier" key="edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          />
        </Tooltip>
      );
    }

    // Bouton valider (si validé par le prof mais pas par l'admin)
    if (record.is_validated_by_professor && !record.is_validated_by_admin) {
      actions.push(
        <Tooltip title="Valider le cours" key="validate">
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            size="small"
            style={{ color: colors.status.success }}
            onClick={() => validateCours(record.id)}
          />
        </Tooltip>
      );
    }

    // Bouton réinitialiser (si validé)
    if (record.is_validated_by_professor || record.is_validated_by_admin) {
      actions.push(
        <Tooltip title="Réinitialiser la validation" key="reset">
          <Popconfirm
            title="Voulez-vous réinitialiser la validation ?"
            onConfirm={() => resetValidation(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="text"
              icon={<ClearOutlined />}
              size="small"
              style={{ color: colors.status.warning }}
            />
          </Popconfirm>
        </Tooltip>
      );
    }

    // Bouton supprimer
    actions.push(
      <Tooltip title="Supprimer" key="delete">
        <Popconfirm
          title="Voulez-vous supprimer ce planning ?"
          onConfirm={() => deletePlanning(record.id)}
          okText="Oui"
          cancelText="Non"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      </Tooltip>
    );

    return <Space size="small">{actions}</Space>;
  };

  // Colonnes du tableau
  const columns = [
    {
      title: "Professeur",
      dataIndex: "user_details",
      key: "professeur",
      sorter: (a, b) => {
        const nameA = `${a.user_details?.first_name || ""} ${a.user_details?.last_name || ""}`;
        const nameB = `${b.user_details?.first_name || ""} ${b.user_details?.last_name || ""}`;
        return nameA.localeCompare(nameB);
      },
      render: (userDetails) => userDetails ? 
        `${userDetails.first_name} ${userDetails.last_name}` : 
        "Non assigné",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: "Horaire",
      key: "horaire",
      render: (_, record) => record.horaire_details ? (
        <div>
          <div>{record.horaire_details.time_start_course?.slice(0, 5)} - {record.horaire_details.time_end_course?.slice(0, 5)}</div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {record.horaire_details.jours} - {record.horaire_details.salle}
          </div>
        </div>
      ) : "Non défini",
    },
    {
      title: "Statut",
      key: "status",
      filters: [
        { text: 'Validé Admin', value: 'validated_admin' },
        { text: 'En attente Admin', value: 'pending_admin' },
        { text: 'Non effectué', value: 'pending_professor' },
      ],
      onFilter: (value, record) => {
        switch (value) {
          case 'validated_admin': return record.is_validated_by_admin;
          case 'pending_admin': return record.is_validated_by_professor && !record.is_validated_by_admin;
          case 'pending_professor': return !record.is_validated_by_professor;
          default: return true;
        }
      },
      render: (_, record) => renderValidationStatus(record),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: renderActions,
    },
  ];

  const filteredPlannings = getFilteredPlannings();

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Gestion des Plannings 📅</h1>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: spacing.lg }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Plannings"
              value={stats.total || 0}
              prefix={<CalendarOutlined />}
              loading={loadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Validés Professeur"
              value={stats.is_validated_by_professor || 0}
              prefix={<CheckCircleOutlined style={{ color: colors.status.success }} />}
              loading={loadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Validés Admin"
              value={stats.is_validated_by_admin || 0}
              prefix={<CheckCircleOutlined style={{ color: colors.primary.main }} />}
              loading={loadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="En attente"
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined style={{ color: colors.status.warning }} />}
              loading={loadingStats}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtres et actions */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Row gutter={[16, 16]} align="middle">
          
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Professeur"
              allowClear
              value={filters.professeur}
              onChange={(value) => {
                setFilters({...filters, professeur: value});
              }}
              style={{ width: "100%" }}
            >
              {professeurs.map((prof) => (
                <Option key={prof.id} value={prof.id}>
                  {prof.first_name} {prof.last_name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="État"
              allowClear
              value={filters.validationStatus}
              onChange={(value) => setFilters({...filters, validationStatus: value})}
              style={{ width: "100%" }}
            >
              <Option value="pending_professor">Non effectués</Option>
              <Option value="pending_admin">En attente Admin</Option>
              <Option value="validated_admin">Validés Admin</Option>
            </Select>
          </Col>

          <Col xs={24} md={4}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({...filters, dateRange: dates})}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Col>

          <Col xs={24} md={4}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openModal}
              >
                Ajouter
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={exportToCSV}
              >
                Export
              </Button>
              {(filters.search || filters.professeur || filters.validationStatus || filters.dateRange) && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={resetFilters}
                >
                  Réinitialiser
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tableau */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPlannings}
          rowKey="id"
          loading={loadingList}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} sur ${total} plannings`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editMode ? "Modifier le planning" : "Ajouter un planning"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
          >
            <Form.Item
              label="Professeur"
              name="user"
              rules={[{ required: true, message: "Sélectionnez un professeur" }]}
            >
              <Select
                placeholder="Sélectionner un professeur"
                showSearch
                optionFilterProp="children"
                onChange={(value) => {
                  form.setFieldValue('horaire', null);
                }}
              >
                {professeurs.map((prof) => (
                  <Option key={prof.id} value={prof.id}>
                    {prof.first_name} {prof.last_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Horaire"
              name="horaire"
              rules={[{ required: true, message: "Sélectionnez un horaire" }]}
            >
              <Select
                placeholder="Sélectionner un horaire"
                loading={loadingHoraires}
                disabled={!form.getFieldValue('user')}
                optionLabelProp="label"
              >
                {horaires.map((horaire) => (
                  <Option 
                    key={horaire.id} 
                    value={horaire.id}
                    label={`${horaire.jours} ${horaire.time_start_course?.slice(0, 5)} - ${horaire.time_end_course?.slice(0, 5)}`}
                  >
                    <div>
                      <div>{horaire.jours} {horaire.time_start_course?.slice(0, 5)} - {horaire.time_end_course?.slice(0, 5)}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Salle: {horaire.salle} • {horaire.module_details?.name}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Date de début"
                  name="date"
                  rules={[{ required: true, message: "Sélectionnez une date" }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
              
              {!editMode && (
                <Col span={12}>
                  <Form.Item
                    label="Durée (semaines)"
                    name="duration"
                    initialValue={1}
                    rules={[{ required: true, message: "Spécifiez la durée" }]}
                  >
                    <InputNumber
                      min={1}
                      max={52}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.md }}>
                <Button onClick={closeModal} disabled={loadingSubmit}>
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingSubmit}
                >
                  {editMode ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default Planning;