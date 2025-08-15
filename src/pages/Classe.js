import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Spin, Table, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";

import classeService from "../services/classeService";
import { styles, colors, typography, spacing, borderRadius, shadows } from "../utils/styles/designTokens";

const Classe = () => {
  const [classes, setClasses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form] = Form.useForm();

  // Charger toutes les classes
  const fetchClasses = async () => {
    setLoadingList(true);
    try {
      const res = await classeService.getAllClasses();
      if (res.success) {
        setClasses(res.data);
      } else {
        message.error(res.error || "Erreur lors du chargement des classes");
      }
    } catch {
      message.error("Erreur serveur lors du chargement");
    }
    setLoadingList(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Filtrer les classes selon la recherche
  const filteredClasses = classes.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
      name: record.name,
      description: record.description || "",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    form.resetFields();
  };

  // Envoi formulaire (ajout ou modification)
  const handleSubmit = async (values) => {
    setLoadingSubmit(true);
    try {
      if (editMode) {
        const res = await classeService.updateClasse(editId, values);
        if (res.success) {
          message.success("Classe modifiée avec succès !");
        } else {
          message.error(res.error || "Erreur lors de la modification");
        }
      } else {
        const res = await classeService.createClasse(values);
        if (res.success) {
          message.success("Classe ajoutée avec succès !");
        } else {
          message.error(res.error || "Erreur lors de l'ajout");
        }
      }
      closeModal();
      fetchClasses();
    } catch {
      message.error("Erreur serveur");
    }
    setLoadingSubmit(false);
  };

  // Suppression avec confirmation
  const deleteClasse = async (id) => {
    setLoadingList(true);
    try {
      const res = await classeService.deleteClasse(id);
      if (res.success) {
        message.success("Classe supprimée avec succès !");
        fetchClasses();
      } else {
        message.error(res.error || "Erreur lors de la suppression");
      }
    } catch {
      message.error("Erreur serveur");
    }
    setLoadingList(false);
  };

  // Colonnes de la table avec tri, rendu personnalisé et actions
  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <span style={{ fontWeight: typography.fontWeight.semibold }}>{text}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <span style={{ color: colors.text.secondary }}>{text || "-"}</span>
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
            aria-label="Modifier la classe"
          />
          <Popconfirm
            title="Voulez-vous supprimer cette classe ?"
            onConfirm={() => deleteClasse(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ borderRadius: borderRadius.sm }}
              aria-label="Supprimer la classe"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Gestion des Classes 📚</h1>

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
          placeholder="Rechercher par nom ou description..."
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
          Ajouter une classe
        </Button>
      </div>

      {/* Table avec pagination et tri intégrés d'AntD */}
      <Table
        columns={columns}
        dataSource={filteredClasses}
        rowKey="id"
        loading={loadingList}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} sur ${total} classes`,
        }}
        bordered
        style={{ 
          boxShadow: shadows.base, 
          borderRadius: borderRadius.md,
          backgroundColor: colors.secondary.white 
        }}
      />

      {/* Modal création/modification */}
      <Modal
        title={editMode ? "Modifier une classe" : "Ajouter une classe"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        centered
      >
        <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
          >
            <Form.Item
              label="Nom de la classe"
              name="name"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input placeholder="Ex: Licence 1" />
            </Form.Item>

            <Form.Item label="Description de la classe" name="description">
              <Input.TextArea rows={4} placeholder="Description optionnelle" />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: spacing.md,
                }}
              >
                <Button onClick={closeModal} disabled={loadingSubmit}>
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingSubmit}
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

export default Classe;
