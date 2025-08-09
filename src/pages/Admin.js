import React, { useState, useEffect } from "react";

import { FaUser, FaPlus, FaEnvelope, FaPhone,  FaToggleOn, FaToggleOff, FaTrash, FaEdit } from "react-icons/fa";
import axios from "../utils/axiosInstance"; //  On utilise axiosInstance.js
import { Modal, Form, Input, Select, message, Button, Spin} from "antd";

import { useErrorHandler } from '../utils/errorHandler';


const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { handleError } = useErrorHandler();

  const initialUser = {
    first_name: "",
    last_name: "",
    email: ""
  };
  const { Option } = Select;
  
  const [newUser, setNewUser] = useState(initialUser);

  useEffect( () => {
    list_admins();

  }, []);
  

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrer les Admins
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
  
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Gestion de la recherche
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // Ouvrir & fermer le modal
  const openModal = () => setIsModalOpen(true);

  
  const closeModal = () => {
    setIsModalOpen(false);
    setNewUser(initialUser);
    setIsEditing(false);
    setEditingUserId(null);
  };
  
  

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  //Fonction pour la modification
  const editUser = (user) => {
    setNewUser({
      ...user,
      roles: user.roles?.[0]?.id || user.roles, // Pour s'assurer du bon format
      filiere: user.filiere || null,
      classe: user.classe || null,
      modules: user.modules || [],
      fonction: user.fonction || "",
      password: "", // ne pas pré-remplir le mot de passe
    });
    setEditingUserId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  


  //Pour recuperer la liste des classes
  const list_admins = () => {
  setLoadingList(true);
  axios.get("users/admins").then(
    (success) => {
      setUsers(success.data);
      setLoadingList(false);
    },
    (error) => {
      console.log(error);
      setUsers([]);
      setLoadingList(false);
    }
  );
};



  //Fonction pour supprimer un user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`users/${id}`);
      message.success("Admin supprimé !");
      list_admins();
    } catch (error) {
      handleError(error, "Erreur lors de la suppression !");
    }
  };
  

  

  // Fonction pour Ajouter et modification un Admin
  const saveUser = async () => {
    try {
      setLoadingSubmit(true);

      const userToSend = {
        ...newUser,
        roles: Array.isArray(newUser.roles) ? newUser.roles : [newUser.roles],
      };

      const action = isEditing && editingUserId
        ? axios.put(`users/${editingUserId}`, userToSend)
        : axios.post("users", userToSend);

      await action;
      message.success(isEditing ? "Admin modifié avec succès !" : "Admin ajouté avec succès !");
      list_admins();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  


  // Toggle statut Admin
  const toggleStatut = async (id) => {
    try {
      const response = await axios.put(`users/${id}/disable`);
      message.success(response.data.message);
      list_admins();
    } catch (error) {
      handleError(error);
    }
  };
  

  // Fonction d'export CSV
  // const exportToCSV = () => {
  //   const csvContent = [
  //     ["Nom", "Prénom", "Email", "Téléphone", "Filière", "Statut"], // En-têtes
  //     ...filteredUsers.map(user => [
  //       user.first_name,
  //       user.last_name,
  //       user.email,
  //       user.phone,
  //       user.filiere,
  //       user.statut ? "Actif" : "Inactif"
  //     ])
  //   ].map(row => row.join(",")).join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "Admins.csv";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };




  
  


  return (
    <div className="Admins-page">
      <h1>Gestion des Admins 👥</h1>
      <div className="Admins-container wide">
        <div className="search-bar">
          <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={handleSearch} />
        </div>

        <div className="actions">
          <button onClick={openModal} className="add-button">
            <FaPlus /> Ajouter un Admin
          </button>
          {/* <button className="export-button" onClick={exportToCSV}>
            Exporter en CSV
          </button> */}
        </div>

        {/* Tableau des Admins */}
        <div className="Admins-table">
          <div className="table-header">
            <div className="header-cell">Nom & Prénom</div>
            <div className="header-cell">Email</div>
            <div className="header-cell">Statut</div>
            <div className="header-cell">Actions</div>
          </div>
          {loadingList ? (
            <div className="spinner-container">
              <Spin size="large" tip="Chargement des administrateurs..." />
            </div>
          ) : (
          currentItems.map((user) => (
            <div key={user.id} className="table-row">
              <div className="row-cell"><FaUser /> {user.first_name} {user.last_name}</div>
              <div className="row-cell"><FaEnvelope /> {user.email}</div>
              <div className="row-cell" onClick={() => toggleStatut(user.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {user.is_active ? (
                  <>
                    <FaToggleOn className="toggle-on" /> <span style={{ color: '#28a745', fontWeight: 600 }}>OK</span>
                  </>
                ) : (
                  <>
                    <FaToggleOff className="toggle-off" /> <span style={{ color: '#dc3545', fontWeight: 600 }}>Bloqué</span>
                  </>
                )}
              </div>
              <div className="row-cell actions-cell">
                <FaEdit className="edit-icon" onClick={() => editUser(user)} />
                <FaTrash className="delete-icon" onClick={() => deleteUser(user.id)} />
              </div>
            </div>
            ))
          )}  
        </div>

        {/* Pagination */}
        <div className="pagination">
          <Button onClick={prevPage} disabled={currentPage === 1}>
            ◀ Précédent
          </Button>
          <span>Page {currentPage} sur {totalPages}</span>
          <Button onClick={nextPage} disabled={currentPage === totalPages}>
            Suivant ▶
          </Button>
        </div>

        <Modal
          title={isEditing ? "Modifier un Admin" : "Ajouter un Admin"}
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
        >
          <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
            <Form layout="vertical">

              <Form.Item label="Nom" required>
                <Input
                  name="first_name"
                  value={newUser.first_name}
                  onChange={handleInputChange}
                />
              </Form.Item>

              <Form.Item label="Prénom" required>
                <Input
                  name="last_name"
                  value={newUser.last_name}
                  onChange={handleInputChange}
                />
              </Form.Item>

              <Form.Item label="Email" required>
                <Input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                />
              </Form.Item>


              {/* Boutons personnalisés */}
              <div className="modal-buttons">
                <button type="button" onClick={closeModal} disabled={loadingSubmit}>Annuler</button>
                <button
                  type="button"
                  onClick={saveUser}
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <Spin size="small" style={{ color: "white" }} />
                  ) : (
                    isEditing ? "Enregistrer les modifications" : "Ajouter"
                  )}
                </button>
              </div>
            </Form>
          </Spin>
        </Modal>

      </div>
    </div>
  );
};

export default Admin;