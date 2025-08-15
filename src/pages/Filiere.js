import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Spin, Table, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import FiliereService from "../services/filiereService"; // ton service filiere
import { styles, colors, typography, spacing, borderRadius, shadows } from "../utils/styles/designTokens";

const Filiere = () => {
  const [filieres, setFilieres] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form] = Form.useForm();

  // Fetch filieres
  const fetchFilieres = async () => {
    setLoadingList(true);
    try {
      const res = await FiliereService.getAllFilieres();
      if(res.success) {
        setFilieres(res.data);
      } else {
        message.error(res.error || "Erreur lors de la récupération des filières");
      }
    } catch (error) {
      message.error("Erreur serveur");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchFilieres();
  }, []);

  // Filter filieres by search query
  const filteredFilieres = filieres.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open modal for add
  const openModal = () => {
    setIsModalOpen(true);
    setEditMode(false);
    setEditId(null);
    form.resetFields();
  };

  // Open modal for edit
  const openEditModal = (record) => {
    setIsModalOpen(true);
    setEditMode(true);
    setEditId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    form.resetFields();
  };

  // Submit add or edit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoadingSubmit(true);

      if(editMode) {
        const res = await FiliereService.updateFiliere(editId, values);
        if(res.success) {
          message.success("Filière modifiée avec succès !");
        } else {
          message.error(res.error || "Erreur lors de la modification");
        }
      } else {
        const res = await FiliereService.createFiliere(values);
        if(res.success) {
          message.success("Filière créée avec succès !");
        } else {
          message.error(res.error || "Erreur lors de la création");
        }
      }

      closeModal();
      fetchFilieres();
    } catch (err) {
      // Validation error
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Delete filiere
  const deleteFiliere = async (id) => {
    setLoadingList(true);
    try {
      const res = await FiliereService.deleteFiliere(id);
      if(res.success) {
        message.success("Filière supprimée avec succès !");
        fetchFilieres();
      } else {
        message.error(res.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      message.error("Erreur serveur");
    } finally {
      setLoadingList(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: text => <span style={{ fontWeight: typography.fontWeight.semibold }}>{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: text => <span style={{ color: colors.text.secondary }}>{text || "-"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.sm }}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => openEditModal(record)} 
            style={{ backgroundColor: colors.primary.main, borderColor: colors.primary.main }}
          />
          <Popconfirm
            title="Voulez-vous supprimer cette filière ?"
            onConfirm={() => deleteFiliere(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Gestion des Filières 📚</h1>

      {/* Barre de recherche + ajout */}
      <div style={{ marginBottom: spacing.lg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input.Search
          placeholder="Rechercher par nom ou description..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: 400, borderRadius: borderRadius.sm }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large" 
          onClick={openModal}
          style={{ borderRadius: borderRadius.sm }}
        >
          Ajouter une filière
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredFilieres}
        rowKey="id"
        loading={loadingList}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} sur ${total} filières`,
        }}
        bordered
        style={{ boxShadow: shadows.base, borderRadius: borderRadius.md, backgroundColor: colors.secondary.white }}
      />

      {/* Modal */}
      <Modal
        title={editMode ? "Modifier une filière" : "Ajouter une filière"}
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
              label="Nom de la filière"
              name="name"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input placeholder="Nom de la filière" />
            </Form.Item>

            <Form.Item
              label="Description de la filière"
              name="description"
            >
              <Input.TextArea rows={4} placeholder="Description (optionnel)" />
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: spacing.md }}>
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

export default Filiere;
