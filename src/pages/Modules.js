import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Table,
  Popconfirm
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  TeamOutlined,
  CalendarOutlined
} from "@ant-design/icons";

import moduleService from "../services/moduleService";
import filiereService from "../services/filiereService";
import classeService from "../services/classeService";
import { styles, colors, typography, spacing, borderRadius, shadows } from "../utils/styles/designTokens";

const { Title, Text } = Typography;
const { Option } = Select;

const Modules = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modules, setModules] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'
  const [form] = Form.useForm();

  const sessions = ["S1", "S2", "S3", "S4", "S5", "S6"];

  useEffect(() => {
    fetchModules();
    fetchFilieres();
    fetchClasses();
  }, []);

  // Fonctions de récupération des données avec le service
  const fetchModules = async () => {
    setLoadingList(true);
    try {
      const res = await moduleService.getAllModules();
      if (res.success) {
        setModules(res.data);
      } else {
        message.error(res.error || "Erreur lors du chargement des modules");
        setModules([]);
      }
    } catch (error) {
      console.error("Erreur fetchModules:", error);
      message.error("Erreur serveur lors du chargement");
      setModules([]);
    }
    setLoadingList(false);
  };

  const fetchFilieres = async () => {
    try {
      const res = await filiereService.getAllFilieres();
      if (res.success) {
        setFilieres(res.data);
      } else {
        setFilieres([]);
      }
    } catch (error) {
      console.error("Erreur fetchFilieres:", error);
      setFilieres([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classeService.getAllClasses();
      if (res.success) {
        setClasses(res.data);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Erreur fetchClasses:", error);
      setClasses([]);
    }
  };

  // Gestion des modales
  const openModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setSelectedModule(null);
    form.resetFields();
  };

  const closeModal = () => {
    form.resetFields();
    setIsModalOpen(false);
    setSelectedModule(null);
    setIsEditing(false);
  };

  const openEditModal = (mod) => {
    setIsEditing(true);
    setSelectedModule(mod);
    
    form.setFieldsValue({
      ...mod,
      start_date: mod.start_date ? dayjs(mod.start_date) : null,
      end_date: mod.end_date ? dayjs(mod.end_date) : null,
      classe: mod.classe,
      filieres: mod.filieres || [],
    });
    
    setIsModalOpen(true);
  };

  // Soumission du formulaire
  const handleSubmitModule = async (values) => {
    setLoadingSubmit(true);
    try {
      if (values.start_date.isAfter(values.end_date)) {
        message.error("La date de début doit être avant la date de fin.");
        setLoadingSubmit(false);
        return;
      }

      const formattedModule = {
        ...values,
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date.format("YYYY-MM-DD"),
      };

      let res;
      if (isEditing) {
        res = await moduleService.updateModule(selectedModule.id, formattedModule);
      } else {
        res = await moduleService.createModule(formattedModule);
      }

      if (res.success) {
        message.success(isEditing ? "Module modifié avec succès !" : "Module ajouté avec succès !");
        fetchModules();
        closeModal();
      } else {
        message.error(res.error || "Erreur lors de l'enregistrement du module");
      }
    } catch (error) {
      console.error("Erreur handleSubmitModule:", error);
      message.error("Erreur lors de l'enregistrement du module");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Suppression d'un module
  const handleDeleteModule = async (id) => {
    setLoadingList(true);
    try {
      const res = await moduleService.deleteModule(id);
      if (res.success) {
        message.success("Module supprimé avec succès !");
        fetchModules();
      } else {
        message.error(res.error || "Erreur lors de la suppression du module");
      }
    } catch (error) {
      console.error("Erreur handleDeleteModule:", error);
      message.error("Erreur lors de la suppression du module");
    }
    setLoadingList(false);
  };

  // Filtrage des modules
  const filteredModules = modules.filter((mod) =>
    mod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.session?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.classe_details?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Colonnes pour la vue tableau
  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
      render: (text) => (
        <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary.main }}>
          <BookOutlined style={{ marginRight: spacing.xs }} />
          {text}
        </span>
      ),
    },
    {
      title: "Classe",
      dataIndex: ["classe_details", "name"],
      key: "classe",
      render: (text) => (
        <span style={{ color: colors.text.secondary }}>
          <TeamOutlined style={{ marginRight: spacing.xs }} />
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
      sorter: (a, b) => a.session?.localeCompare(b.session),
      render: (text) => (
        <span style={{
          ...styles.statusBadge,
          backgroundColor: colors.primary.main + "20",
          color: colors.primary.main,
          border: `1px solid ${colors.primary.main}40`,
        }}>
          {text}
        </span>
      ),
    },
    {
      title: "Filières",
      dataIndex: "filieres_details",
      key: "filieres",
      render: (filieres) => (
        <span style={{ color: colors.text.secondary }}>
          {filieres?.map(f => f.name).join(", ") || "Aucune"}
        </span>
      ),
    },
    {
      title: "Dates",
      key: "dates",
      render: (_, record) => (
        <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
          <div><CalendarOutlined /> {record.start_date}</div>
          <div style={{ marginTop: 2 }}>au {record.end_date}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: spacing.sm }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
            style={{
              backgroundColor: colors.primary.main,
              borderColor: colors.primary.main,
              borderRadius: borderRadius.sm,
            }}
          />
          <Popconfirm
            title="Voulez-vous supprimer ce module ?"
            onConfirm={() => handleDeleteModule(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ borderRadius: borderRadius.sm }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Gestion des Modules 📚</h1>

      {/* Barre de recherche + actions */}
      <div style={{
        marginBottom: spacing.lg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: spacing.sm,
      }}>
        <Input.Search
          placeholder="Rechercher par module, classe ou session..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 400, borderRadius: borderRadius.sm }}
          value={searchQuery}
        />
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button.Group>
            <Button
              type={viewMode === 'cards' ? 'primary' : 'default'}
              onClick={() => setViewMode('cards')}
              style={{ borderRadius: `${borderRadius.sm} 0 0 ${borderRadius.sm}` }}
            >
              Cards
            </Button>
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => setViewMode('table')}
              style={{ borderRadius: `0 ${borderRadius.sm} ${borderRadius.sm} 0` }}
            >
              Tableau
            </Button>
          </Button.Group>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openModal}
            style={{ borderRadius: borderRadius.sm }}
          >
            Ajouter un Module
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      {loadingList ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: spacing["2xl"],
        }}>
          <Spin size="large" tip="Chargement des modules..." />
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <Row gutter={[20, 20]} justify="start">
              {filteredModules.slice().reverse().map((mod) => (
                <Col key={mod.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() => openEditModal(mod)}
                    style={{
                      ...styles.card,
                      borderRadius: borderRadius.md,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: spacing.md }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = shadows.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = shadows.base;
                    }}
                    actions={[
                      <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); openEditModal(mod); }} />,
                      <Popconfirm
                        key="delete"
                        title="Voulez-vous supprimer ce module ?"
                        onConfirm={(e) => { e?.stopPropagation(); handleDeleteModule(mod.id); }}
                        okText="Oui"
                        cancelText="Non"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteOutlined style={{ color: colors.status.error }} />
                      </Popconfirm>
                    ]}
                  >
                    <div style={{ textAlign: 'center', marginBottom: spacing.md }}>
                      <BookOutlined style={{ 
                        fontSize: typography.fontSize['2xl'], 
                        color: colors.primary.main,
                        marginBottom: spacing.sm 
                      }} />
                      <Title level={4} style={{ 
                        margin: 0, 
                        color: colors.text.primary,
                        fontSize: typography.fontSize.lg 
                      }}>
                        {mod.name}
                      </Title>
                    </div>
                    
                    <div style={{ marginBottom: spacing.xs }}>
                      <TeamOutlined style={{ marginRight: spacing.xs, color: colors.primary.main }} />
                      <Text strong>Classe: </Text>
                      <Text style={{ color: colors.text.secondary }}>
                        {mod.classe_details?.name || "Non assignée"}
                      </Text>
                    </div>
                    
                    <div style={{ marginBottom: spacing.xs }}>
                      <CalendarOutlined style={{ marginRight: spacing.xs, color: colors.primary.main }} />
                      <Text strong>Session: </Text>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: colors.primary.main + "20",
                        color: colors.primary.main,
                        border: `1px solid ${colors.primary.main}40`,
                        fontSize: typography.fontSize.xs,
                        padding: `${spacing.xs} ${spacing.sm}`,
                      }}>
                        {mod.session}
                      </span>
                    </div>
                    
                    <div style={{ marginTop: spacing.sm }}>
                      <Text strong style={{ color: colors.text.primary }}>Filières: </Text>
                      <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                        {mod.filieres_details?.map((f) => f.name).join(", ") || "Aucune"}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredModules}
              rowKey="id"
              loading={loadingList}
              pagination={{ pageSize: 10 }}
              bordered
              style={{ 
                boxShadow: shadows.base, 
                borderRadius: borderRadius.md,
                backgroundColor: colors.secondary.white 
              }}
            />
          )}
        </>
      )}

      {/* Modal d'ajout/modification */}
      <Modal
        title={
          <span style={{ color: colors.primary.main, fontWeight: typography.fontWeight.semibold }}>
            <BookOutlined style={{ marginRight: spacing.xs }} />
            {isEditing ? "Modifier un Module" : "Ajouter un Module"}
          </span>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSubmitModule}
            preserve={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="name" 
                  label="Nom du module" 
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <Input placeholder="Ex: Mathématiques" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="session" 
                  label="Session" 
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <Select placeholder="Sélectionner une session">
                    {sessions.map((session) => (
                      <Option key={session} value={session}>{session}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Description du module" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="start_date" 
                  label="Date de début" 
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="end_date" 
                  label="Date de fin" 
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="classe" 
                  label="Classe" 
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <Select placeholder="Sélectionner une classe">
                    {classes.map((classe) => (
                      <Option key={classe.id} value={classe.id}>{classe.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="filieres" 
                  label="Filières" 
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Sélectionner une ou plusieurs filières"
                  >
                    {filieres.map((filiere) => (
                      <Option key={filiere.id} value={filiere.id}>{filiere.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, marginTop: spacing.lg }}>
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: spacing.md,
              }}>
                <Button onClick={closeModal} disabled={loadingSubmit}>
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingSubmit}
                  style={{ borderRadius: borderRadius.sm }}
                >
                  {isEditing ? "Enregistrer les modifications" : "Ajouter le module"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default Modules;