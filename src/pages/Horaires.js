import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Form, 
  Select, 
  TimePicker, 
  Button, 
  message, 
  Table, 
  Input,
  Popconfirm,
  Tag,
  Spin
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  HomeOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import moment from "moment";

import HoraireService from "../services/horaireService";
import moduleService from "../services/moduleService"; 
import { styles, colors, typography, spacing, borderRadius, shadows } from "../utils/styles/designTokens";

const { Option } = Select;

const Horaires = () => {
  const [form] = Form.useForm();
  const [horaires, setHoraires] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const sallesClasse = ["Salle I", "Salle II", "Salle III", "Salle IV", "Salle V", "Salle VI", "Salle informatique"];

  // Charger les données
  const fetchHoraires = async () => {
    setLoadingList(true);
    try {
      const res = await HoraireService.getAllHoraires();
      if (res.success) {
        setHoraires(res.data);
      } else {
        message.error(res.error || "Erreur lors du chargement des horaires");
      }
    } catch {
      message.error("Erreur serveur lors du chargement des horaires");
    }
    setLoadingList(false);
  };

  const fetchModules = async () => {
    try {
      const res = await moduleService.getAllModules();
      if (res.success) {
        setModules(res.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des modules:", error);
    }
  };

  useEffect(() => {
    fetchHoraires();
    fetchModules();
  }, []);

  // Filtrer les horaires selon la recherche
  const filteredHoraires = horaires.filter((horaire) =>
    horaire.jours?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    horaire.module_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    horaire.salle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      jours: record.jours,
      time_start_course: moment(record.time_start_course, "HH:mm"),
      time_end_course: moment(record.time_end_course, "HH:mm"),
      module: record.module_details?.id,
      salle: record.salle,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setEditId(null);
    form.resetFields();
  };

  // Envoi formulaire (ajout ou modification)
  const handleSubmit = async (values) => {
    setLoadingSubmit(true);
    try {
      // Validation des heures
      if (values.time_start_course.isAfter(values.time_end_course)) {
        message.error("L'heure de début doit être avant l'heure de fin");
        setLoadingSubmit(false);
        return;
      }

      const data = {
        jours: values.jours,
        time_start_course: values.time_start_course.format("HH:mm"),
        time_end_course: values.time_end_course.format("HH:mm"),
        module: values.module,
        salle: values.salle,
      };

      let res;
      if (editMode) {
        res = await HoraireService.updateHoraire(editId, data);
        if (res.success) {
          message.success("Horaire modifié avec succès !");
        } else {
          message.error(res.error || "Erreur lors de la modification");
        }
      } else {
        res = await HoraireService.createHoraire(data);
        if (res.success) {
          message.success("Horaire ajouté avec succès !");
        } else {
          message.error(res.error || "Erreur lors de l'ajout");
        }
      }

      if (res.success) {
        closeModal();
        fetchHoraires();
      }
    } catch (error) {
      console.error("Erreur:", error);
      message.error("Erreur serveur");
    }
    setLoadingSubmit(false);
  };

  // Suppression avec confirmation
  const deleteHoraire = async (id) => {
    setLoadingList(true);
    try {
      const res = await HoraireService.deleteHoraire(id);
      if (res.success) {
        message.success("Horaire supprimé avec succès !");
        fetchHoraires();
      } else {
        message.error(res.error || "Erreur lors de la suppression");
      }
    } catch {
      message.error("Erreur serveur");
    }
    setLoadingList(false);
  };

  // Fonction pour obtenir la couleur du jour
  const getJourColor = (jour) => {
    const colorMap = {
      'Lundi': colors.chart.blue,
      'Mardi': colors.chart.green,
      'Mercredi': colors.chart.yellow,
      'Jeudi': colors.chart.orange,
      'Vendredi': colors.chart.cyan,
      'Samedi': colors.chart.teal,
      'Dimanche': colors.chart.red,
    };
    return colorMap[jour] || colors.primary.main;
  };

  // Colonnes de la table
  const columns = [
    {
      title: (
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Jour
        </span>
      ),
      dataIndex: "jours",
      key: "jours",
      sorter: (a, b) => a.jours.localeCompare(b.jours),
      render: (jour) => (
        <Tag 
          color={getJourColor(jour)} 
          style={{ 
            fontWeight: typography.fontWeight.semibold,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: borderRadius.sm
          }}
        >
          {jour}
        </Tag>
      ),
      filters: joursSemaine.map(jour => ({ text: jour, value: jour })),
      onFilter: (value, record) => record.jours === value,
    },
    {
      title: (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Heures
        </span>
      ),
      key: "heures",
      render: (_, record) => (
        <span style={{ fontWeight: typography.fontWeight.medium }}>
          {record.time_start_course} - {record.time_end_course}
        </span>
      ),
      sorter: (a, b) => a.time_start_course.localeCompare(b.time_start_course),
    },
    {
      title: (
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          Module
        </span>
      ),
      dataIndex: ["module_details", "name"],
      key: "module",
      ellipsis: true,
      render: (text) => (
        <span style={{ 
          color: colors.primary.main,
          fontWeight: typography.fontWeight.medium 
        }}>
          {text || "Module non défini"}
        </span>
      ),
    },
    {
      title: (
        <span>
          <HomeOutlined style={{ marginRight: 8 }} />
          Salle
        </span>
      ),
      dataIndex: "salle",
      key: "salle",
      render: (salle) => (
        <Tag 
          color="geekblue"
          style={{ 
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: borderRadius.sm
          }}
        >
          {salle}
        </Tag>
      ),
      filters: sallesClasse.map(salle => ({ text: salle, value: salle })),
      onFilter: (value, record) => record.salle === value,
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
            aria-label="Modifier l'horaire"
          />
          <Popconfirm
            title="Voulez-vous supprimer cet horaire ?"
            onConfirm={() => deleteHoraire(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ borderRadius: borderRadius.sm }}
              aria-label="Supprimer l'horaire"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>
        <ClockCircleOutlined style={{ marginRight: spacing.sm }} />
        Gestion des Horaires
      </h1>

      {/* Barre de recherche + bouton ajouter */}
      <div
        style={{
          marginBottom: spacing.lg,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        <Input.Search
          placeholder="Rechercher par jour, module ou salle..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 400, borderRadius: borderRadius.sm }}
          value={searchQuery}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openModal}
          style={{ borderRadius: borderRadius.sm }}
        >
          Ajouter un horaire
        </Button>
      </div>

      {/* Table avec pagination et tri intégrés d'AntD */}
      <Table
        columns={columns}
        dataSource={filteredHoraires}
        rowKey="id"
        loading={loadingList}
        pagination={{ 
          pageSize: 8,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} horaires`
        }}
        bordered
        style={{ 
          boxShadow: shadows.base, 
          borderRadius: borderRadius.md,
          backgroundColor: colors.secondary.white
        }}
        scroll={{ x: 800 }}
      />

      {/* Modal création/modification */}
      <Modal
        title={
          <span>
            <ClockCircleOutlined style={{ marginRight: spacing.sm }} />
            {editMode ? "Modifier un horaire" : "Ajouter un horaire"}
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
            onFinish={handleSubmit}
            preserve={false}
            style={{ marginTop: spacing.md }}
          >
            <Form.Item
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: spacing.xs }} />
                  Jour de la semaine
                </span>
              }
              name="jours"
              rules={[{ required: true, message: "Veuillez sélectionner un jour" }]}
            >
              <Select placeholder="Choisir un jour" size="large">
                {joursSemaine.map((jour) => (
                  <Option key={jour} value={jour}>
                    {jour}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ display: "flex", gap: spacing.md }}>
              <Form.Item
                label={
                  <span>
                    <ClockCircleOutlined style={{ marginRight: spacing.xs }} />
                    Heure de début
                  </span>
                }
                name="time_start_course"
                rules={[{ required: true, message: "Heure de début requise" }]}
                style={{ flex: 1 }}
              >
                <TimePicker 
                  format="HH:mm" 
                  size="large" 
                  style={{ width: "100%" }}
                  placeholder="Sélectionner l'heure"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <ClockCircleOutlined style={{ marginRight: spacing.xs }} />
                    Heure de fin
                  </span>
                }
                name="time_end_course"
                rules={[{ required: true, message: "Heure de fin requise" }]}
                style={{ flex: 1 }}
              >
                <TimePicker 
                  format="HH:mm" 
                  size="large" 
                  style={{ width: "100%" }}
                  placeholder="Sélectionner l'heure"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span>
                  <BookOutlined style={{ marginRight: spacing.xs }} />
                  Module
                </span>
              }
              name="module"
              rules={[{ required: true, message: "Veuillez sélectionner un module" }]}
            >
              <Select 
                placeholder="Choisir un module" 
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {modules.map((module) => (
                  <Option key={module.id} value={module.id}>
                    {module.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span>
                  <HomeOutlined style={{ marginRight: spacing.xs }} />
                  Salle
                </span>
              }
              name="salle"
              rules={[{ required: true, message: "Veuillez sélectionner une salle" }]}
            >
              <Select placeholder="Choisir une salle" size="large">
                {sallesClasse.map((salle) => (
                  <Option key={salle} value={salle}>
                    {salle}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: spacing.md,
                  marginTop: spacing.lg,
                }}
              >
                <Button 
                  onClick={closeModal} 
                  disabled={loadingSubmit}
                  size="large"
                >
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingSubmit}
                  size="large"
                  style={{ borderRadius: borderRadius.sm }}
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

export default Horaires;