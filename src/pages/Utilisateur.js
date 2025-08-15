import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Spin, Table, Popconfirm, Select, Switch, Tag, Row, Col } from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined
} from "@ant-design/icons";

import UserService from "../services/userService";
import classeService from "../services/classeService";
import filiereService from "../services/filiereService";
import roleService from "../services/roleService";
import moduleService from "../services/moduleService";
import { colors, typography, spacing, borderRadius, shadows } from "../utils/styles/designTokens";

const { Option } = Select;

const Utilisateur = () => {
  // États pour les données
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);

  // États pour l'interface utilisateur
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form] = Form.useForm();

  // Charger toutes les données au montage du composant
  useEffect(() => {
    loadAllData();
  }, []);

  // Fonction pour charger toutes les données nécessaires
  const loadAllData = async () => {
    setLoadingList(true);
    try {
      const [usersResult, classesResult, filieresResult, rolesResult, modulesResult] = await Promise.all([
        UserService.getAllUsers(),
        classeService.getAllClasses(),
        filiereService.getAllFilieres(),
        roleService.getAllRoles(),
        moduleService.getAllModules()
      ]);

      if (usersResult.success) {
        setUsers(usersResult.data);
      } else {
        message.error(usersResult.error || "Erreur lors du chargement des utilisateurs");
      }

      if (classesResult.success) setClasses(classesResult.data);
      if (filieresResult.success) setFilieres(filieresResult.data);
      if (rolesResult.success) setRoles(rolesResult.data);
      if (modulesResult.success) setModules(modulesResult.data);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error('Erreur serveur lors du chargement des données');
    } finally {
      setLoadingList(false);
    }
  };

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const filiere = user.filiere?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || 
           email.includes(query) || 
           filiere.includes(query);
  });

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
      first_name: record.first_name || "",
      last_name: record.last_name || "",
      email: record.email || "",
      phone: record.phone || "",
      roles: Array.isArray(record.roles) ? record.roles.map(r => r.id || r) : [record.roles?.id || record.roles],
      filiere: record.filiere?.id || record.filiere || undefined,
      classe: record.classe?.id || record.classe || undefined,
      modules: Array.isArray(record.modules) ? record.modules.map(m => m.id || m) : []
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
      let result;
      if (editMode) {
        result = await UserService.updateUser(editId, values);
      } else {
        result = await UserService.createUser(values);
      }

      if (result.success) {
        message.success(editMode ? "Utilisateur modifié avec succès !" : "Utilisateur ajouté avec succès !");
        closeModal();
        loadAllData(); // Recharger toutes les données
      } else {
        message.error(result.error || "Erreur lors de l'opération");
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      message.error('Erreur serveur lors de la sauvegarde');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Suppression avec confirmation
  const deleteUser = async (id) => {
    setLoadingList(true);
    try {
      const result = await UserService.deleteUser(id);
      if (result.success) {
        message.success("Utilisateur supprimé avec succès !");
        loadAllData(); // Recharger les données
      } else {
        message.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error('Erreur serveur lors de la suppression');
    } finally {
      setLoadingList(false);
    }
  };

  // Basculer le statut d'un utilisateur
  const handleToggleStatus = async (id) => {
    try {
      const result = await UserService.toggleUserStatus(id);
      if (result.success) {
        message.success(result.message || "Statut modifié avec succès !");
        loadAllData(); // Recharger les données
      } else {
        message.error(result.error || "Erreur lors du changement de statut");
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      message.error('Erreur serveur lors du changement de statut');
    }
  };

  // Obtenir le nom d'un rôle par son ID
  const getRoleNameById = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Inconnu';
  };

  // Obtenir la couleur d'un rôle
  const getRoleColor = (roleName) => {
    const roleColors = {
      'student': 'blue',
      'etudiant': 'blue',
      'professor': 'green',
      'professeur': 'green',
      'staff': 'purple',
      'admin': 'red',
      'administrator': 'red',
    };
    return roleColors[roleName?.toLowerCase()] || 'default';
  };

  // Colonnes de la table
  const columns = [
    {
      title: "Nom complet",
      key: "fullName",
      sorter: (a, b) => {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`;
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`;
        return nameA.localeCompare(nameB);
      },
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <UserOutlined style={{ color: colors.primary.main }} />
          <span style={{ fontWeight: typography.fontWeight.semibold }}>
            {`${record.first_name || ''} ${record.last_name || ''}`.trim() || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <MailOutlined style={{ color: colors.status.info }} />
          <span style={{ color: colors.text.secondary }}>{email || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: "Téléphone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <PhoneOutlined style={{ color: colors.status.success }} />
          <span style={{ color: colors.text.secondary }}>{phone || 'Non renseigné'}</span>
        </div>
      ),
    },
    {
      title: "Filière",
      key: "filiere",
      render: (_, record) => (
        <Tag color="blue" style={{ borderRadius: borderRadius.sm }}>
          {record.filiere?.name || 'Non assignée'}
        </Tag>
      ),
    },
    {
      title: "Rôle(s)",
      key: "roles",
      render: (_, record) => {
        const userRoles = Array.isArray(record.roles) ? record.roles : [record.roles].filter(Boolean);
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
            {userRoles.map((role, index) => {
              const roleName = role?.name || getRoleNameById(role);
              return (
                <Tag 
                  key={index} 
                  color={getRoleColor(roleName)}
                  style={{ borderRadius: borderRadius.sm }}
                >
                  {roleName}
                </Tag>
              );
            })}
            {userRoles.length === 0 && (
              <Tag color="default" style={{ borderRadius: borderRadius.sm }}>
                Aucun rôle
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Statut",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.is_active !== false}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="Actif"
          unCheckedChildren="Inactif"
          size="small"
        />
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
            aria-label="Modifier l'utilisateur"
          />
          <Popconfirm
            title="Voulez-vous supprimer cet utilisateur ?"
            onConfirm={() => deleteUser(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ borderRadius: borderRadius.sm }}
              aria-label="Supprimer l'utilisateur"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{
      padding: spacing.lg,
      backgroundColor: colors.secondary.background,
      minHeight: '100vh',
    }}>
      <h1 style={{
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.lg,
        color: colors.text.primary,
      }}>
        Gestion des Utilisateurs 👥
      </h1>

      {/* Barre de recherche + boutons */}
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
          placeholder="Rechercher par nom, email ou filière..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 400, borderRadius: borderRadius.sm }}
          value={searchQuery}
        />
        
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            size="large"
            onClick={loadAllData}
            loading={loadingList}
            style={{ borderRadius: borderRadius.sm }}
          >
            Actualiser
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openModal}
            style={{ borderRadius: borderRadius.sm }}
          >
            Ajouter un utilisateur
          </Button>
        </div>
      </div>

      {/* Table avec pagination et tri intégrés d'AntD */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loadingList}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} sur ${total} utilisateurs`,
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
        title={editMode ? "Modifier un utilisateur" : "Ajouter un utilisateur"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        centered
        width={800}
      >
        <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Prénom"
                  name="first_name"
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <Input placeholder="Prénom" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Nom"
                  name="last_name"
                  rules={[{ required: true, message: "Ce champ est requis" }]}
                >
                  <Input placeholder="Nom de famille" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Ce champ est requis" },
                    { type: "email", message: "Format d'email invalide" }
                  ]}
                >
                  <Input placeholder="email@exemple.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Téléphone" name="phone">
                  <Input placeholder="Numéro de téléphone" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Rôle(s)"
                  name="roles"
                  rules={[{ required: true, message: "Sélectionnez au moins un rôle" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Sélectionner des rôles"
                    loading={!roles.length}
                  >
                    {roles.map(role => (
                      <Option key={role.id} value={role.id}>
                        {role.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Filière" name="filiere">
                  <Select
                    placeholder="Sélectionner une filière"
                    allowClear
                    loading={!filieres.length}
                  >
                    {filieres.map(filiere => (
                      <Option key={filiere.id} value={filiere.id}>
                        {filiere.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Classe" name="classe">
                  <Select
                    placeholder="Sélectionner une classe"
                    allowClear
                    loading={!classes.length}
                  >
                    {classes.map(classe => (
                      <Option key={classe.id} value={classe.id}>
                        {classe.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Modules" name="modules">
                  <Select
                    mode="multiple"
                    placeholder="Sélectionner des modules"
                    loading={!modules.length}
                  >
                    {modules.map(module => (
                      <Option key={module.id} value={module.id}>
                        {module.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>


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

export default Utilisateur;