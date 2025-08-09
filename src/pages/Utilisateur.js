// src/utilisateur/Utilisateur.js
// Composant Utilisateur avec approche simplifiée - utilisation directe des services

import React, { useState, useEffect } from "react";

import { FaUser, FaPlus, FaEnvelope, FaPhone, FaTrash, FaEdit, FaSync } from "react-icons/fa";
import { Modal, Form, Input, Select, message, Button, Spin, Table, Tag, Card, Row, Col, Typography, Popconfirm, Switch } from "antd";

// Import direct des services
import userService from '../services/userService';
import classService from '../services/classService';
import filiereService from '../services/filiereService';
import roleService from '../services/roleService';
import moduleService from '../services/moduleService';

const { Title } = Typography;
const { Option } = Select;

const Utilisateur = () => {
  // États pour les données
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);

  // États pour l'interface utilisateur
  const [searchQuery, setSearchQuery] = useState("");
  const [photo, setPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fonctions = ["Secrétaire", "Responsable Pédagogique"];

  const initialUser = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    roles: [],
    filiere: "",
    classe: "",
    modules: [],
    fonction: "",
  };
  
  const [newUser, setNewUser] = useState(initialUser);

  // Charger toutes les données au montage du composant
  useEffect(() => {
    loadAllData();
  }, []);

  // Fonction pour charger toutes les données nécessaires
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersResult, classesResult, filieresResult, rolesResult, modulesResult] = await Promise.all([
        userService.getUsers(),
        classService.getClasses(),
        filiereService.getFilieres(),
        roleService.getRoles(),
        moduleService.getModules()
      ]);

      if (usersResult.success) {
        setUsers(usersResult.data);
        message.success(usersResult.message);
      } else {
        message.error(usersResult.error);
      }

      if (classesResult.success) setClasses(classesResult.data);
      if (filieresResult.success) setFilieres(filieresResult.data);
      if (rolesResult.success) setRoles(rolesResult.data);
      if (modulesResult.success) setModules(modulesResult.data);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const filiere = user.filiere?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || 
           email.includes(query) || 
           filiere.includes(query);
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Gestion de la recherche
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset à la première page lors de la recherche
  };

  // Ouvrir & fermer le modal
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setNewUser(initialUser);
    setEditingUserId(null);
    setIsEditing(false);
    setPhoto(null);
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // Éditer un utilisateur
  const editUser = (user) => {
    setNewUser({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      roles: Array.isArray(user.roles) ? user.roles.map(r => r.id || r) : [user.roles?.id || user.roles],
      filiere: user.filiere?.id || user.filiere || "",
      classe: user.classe?.id || user.classe || "",
      modules: Array.isArray(user.modules) ? user.modules.map(m => m.id || m) : [],
      fonction: user.fonction || "",
    });
    setEditingUserId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Sauvegarder un utilisateur (créer ou modifier)
  const handleSaveUser = async () => {
    setSubmitting(true);
    try {
      let result;
      if (isEditing && editingUserId) {
        result = await userService.updateUser(editingUserId, newUser, photo);
      } else {
        result = await userService.createUser(newUser, photo);
      }

      if (result.success) {
        message.success(result.message);
        closeModal();
        // Recharger les utilisateurs
        const usersResult = await userService.getUsers();
        if (usersResult.success) {
          setUsers(usersResult.data);
        }
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      message.error('Erreur lors de la sauvegarde de l\'utilisateur');
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (id) => {
    try {
      const result = await userService.deleteUser(id);
      if (result.success) {
        message.success(result.message);
        // Recharger les utilisateurs
        const usersResult = await userService.getUsers();
        if (usersResult.success) {
          setUsers(usersResult.data);
        }
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Basculer le statut d'un utilisateur
  const handleToggleStatus = async (id) => {
    try {
      const result = await userService.toggleUserStatus(id);
      if (result.success) {
        message.success(result.message);
        // Recharger les utilisateurs
        const usersResult = await userService.getUsers();
        if (usersResult.success) {
          setUsers(usersResult.data);
        }
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      message.error('Erreur lors du changement de statut');
    }
  };

  // Obtenir le nom d'un rôle par son ID
  const getRoleNameById = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Inconnu';
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom complet',
      key: 'fullName',
      render: (_, record) => (
        <div className="user-info">
          <FaUser className="user-icon" />
          <span>{`${record.first_name || ''} ${record.last_name || ''}`}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div className="user-email">
          <FaEnvelope className="email-icon" />
          <span>{email}</span>
        </div>
      ),
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <div className="user-phone">
          <FaPhone className="phone-icon" />
          <span>{phone || 'Non renseigné'}</span>
        </div>
      ),
    },
    {
      title: 'Filière',
      key: 'filiere',
      render: (_, record) => (
        <Tag color="blue">
          {record.filiere?.name || 'Non assignée'}
        </Tag>
      ),
    },
    {
      title: 'Rôle',
      key: 'role',
      render: (_, record) => {
        const roleNames = Array.isArray(record.roles) 
          ? record.roles.map(r => r.name || getRoleNameById(r)).join(', ')
          : record.roles?.name || getRoleNameById(record.roles) || 'Aucun rôle';
        return <Tag color="green">{roleNames}</Tag>;
      },
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => (
        <Switch
          checked={record.is_active !== false}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="Actif"
          unCheckedChildren="Inactif"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="primary"
            size="small"
            icon={<FaEdit />}
            onClick={() => editUser(record)}
            style={{ marginRight: 8 }}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<FaTrash />}
            >
              Supprimer
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="utilisateur-container">
      <Card className="utilisateur-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <FaUser style={{ marginRight: 8 }} />
              Gestion des Utilisateurs
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={openModal}
              size="large"
            >
              Ajouter un utilisateur
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="utilisateur-content">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Rechercher par nom, email ou filière..."
              value={searchQuery}
              onChange={handleSearch}
              prefix={<FaUser />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              icon={<FaSync />}
              onClick={loadAllData}
              loading={loading}
            >
              Actualiser
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={currentItems}
            rowKey="id"
            pagination={{
              current: currentPage,
              total: filteredUsers.length,
              pageSize: itemsPerPage,
              onChange: setCurrentPage,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} sur ${total} utilisateurs`,
            }}
          />
        </Spin>
      </Card>

      {/* Modal pour ajouter/modifier un utilisateur */}
      <Modal
        title={isEditing ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSaveUser}
          >
            {isEditing ? "Modifier" : "Ajouter"}
          </Button>,
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Prénom" required>
                <Input
                  name="first_name"
                  value={newUser.first_name}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nom" required>
                <Input
                  name="last_name"
                  value={newUser.last_name}
                  onChange={handleInputChange}
                  placeholder="Nom"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Email" required>
            <Input
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item label="Téléphone">
            <Input
              name="phone"
              value={newUser.phone}
              onChange={handleInputChange}
              placeholder="Téléphone"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Rôle" required>
                <Select
                  value={newUser.roles}
                  onChange={(value) => handleSelectChange('roles', value)}
                  placeholder="Sélectionner un rôle"
                  mode="multiple"
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
              <Form.Item label="Filière">
                <Select
                  value={newUser.filiere}
                  onChange={(value) => handleSelectChange('filiere', value)}
                  placeholder="Sélectionner une filière"
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
              <Form.Item label="Classe">
                <Select
                  value={newUser.classe}
                  onChange={(value) => handleSelectChange('classe', value)}
                  placeholder="Sélectionner une classe"
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
              <Form.Item label="Modules">
                <Select
                  value={newUser.modules}
                  onChange={(value) => handleSelectChange('modules', value)}
                  placeholder="Sélectionner des modules"
                  mode="multiple"
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

          {/* Champ fonction pour le personnel */}
          {newUser.roles && newUser.roles.some(roleId => {
            const role = roles.find(r => r.id === roleId);
            return role?.name?.toLowerCase() === 'personnel';
          }) && (
            <Form.Item label="Fonction">
              <Select
                value={newUser.fonction}
                onChange={(value) => handleSelectChange('fonction', value)}
                placeholder="Sélectionner une fonction"
              >
                {fonctions.map(fonction => (
                  <Option key={fonction} value={fonction}>
                    {fonction}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Champ photo pour les étudiants */}
          {newUser.roles && newUser.roles.some(roleId => {
            const role = roles.find(r => r.id === roleId);
            return role?.name?.toLowerCase() === 'student';
          }) && (
            <Form.Item label="Photo">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Utilisateur;
