import React, { useState, useEffect } from "react";
import "./Utilisateur.css";
import { FaUser, FaPlus, FaEnvelope, FaPhone,  FaToggleOn, FaToggleOff, FaTrash, FaEdit } from "react-icons/fa";
import axios, { postForm, putForm } from "../AxiosInstance/axiosInstance"; // On utilise axiosInstance.js et les helpers pour formData
import { Modal, Form, Input, Select, message, Button, Spin } from "antd";
import "./Utilisateur.css";
import { useErrorHandler } from '../utils/errorHandler';


const Utilisateur = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);


  const [modules, setModules] = useState([]);
  const [photo, setPhoto] = useState(null);
  const fonctions = ["Secrétaire", "Responsable Pédagogique"];
  const initialUser = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    filiere: null,
    classe: null,
    roles: [],
    modules: [],
    fonction: "",
  };
  const { Option } = Select;
  
  const [newUser, setNewUser] = useState(initialUser);
  const { handleError } = useErrorHandler();

  useEffect( () => {
    list_users();
    list_classes();
    list_filieres();
    list_modules();
    list_roles();

  }, []);
  

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const filiere = user.filiere?.name?.toLowerCase() || "";
  
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      filiere.includes(searchQuery.toLowerCase())
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
    setPhoto(null);
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
    });
    setEditingUserId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  


  //Pour recuperer la liste des classes
  const list_users = () => {
  setLoadingList(true);
  axios.get("users").then(
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

  //Pour recuperer la liste des classes
  const list_modules = () => {
    axios.get("modules").then(
      (success) => {
        console.log(success);
        setModules(success.data);

      },

      (error) => {
        console.log(error)
        setModules([]);

      }
      )

  };
  //Pour recuperer la liste des roles
  const list_roles = () => {
    axios.get("roles").then(
      (success) => {
        console.log(success);
        setRoles(success.data);

      },

      (error) => {
        console.log(error)
        setRoles([]);

      }
      )

  };
  //Pour recuperer la liste des filieres
  const list_filieres = () => {
    axios.get("filieres").then(
      (success) => {
        console.log(success);
        setFilieres(success.data);

      },

      (error) => {
        console.log(error)
        setFilieres([]);

      }
      )

  };

  //Pour recuperer la liste des classes
  const list_classes = () => {
    axios.get("classes").then(
      (success) => {
        console.log(success);
        setClasses(success.data);

      },

      (error) => {
        console.log(error)
        setClasses([]);

      }
      )

  };


  //Fonction pour supprimer un user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`users/${id}`);
      message.success("Utilisateur supprimé avec succès !");
      list_users();
    } catch (error) {
      handleError(error, "Erreur lors de la suppression !");
    }
  };
  

  

  // Fonction pour Ajouter et modification un utilisateur
  const saveUser = async () => {
  setLoadingSubmit(true);
  const userToSend = {
    ...newUser,
    roles: Array.isArray(newUser.roles) ? newUser.roles : [newUser.roles],
  };

  let axiosCall;
  // Si étudiant et photo présente, on utilise FormData
  if (getRoleNameById(newUser.roles)?.toLowerCase() === "student" && photo) {
    const formData = new FormData();
    Object.entries(userToSend).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, value ?? "");
      }
    });
    formData.append("photo", photo);

    axiosCall = isEditing && editingUserId
      ? putForm(`users/${editingUserId}`, formData)
      : postForm("users", formData);
  } else {
    // Sinon, en JSON classique
    axiosCall = isEditing && editingUserId
      ? axios.put(`users/${editingUserId}`, userToSend)
      : axios.post("users", userToSend);
  }

  axiosCall
    .then(() => {
      message.success(isEditing ? "Utilisateur modifié avec succès !" : "Utilisateur ajouté avec succès !");
      list_users();
      closeModal();
      setPhoto(null); // reset la photo
    })
    .catch((error) => {
      handleError(error);
    })
    .finally(() => {
      setLoadingSubmit(false);
    });
};

  


  // Toggle statut utilisateur
  const toggleStatut = async (id) => {
    axios.put(`users/${id}/disable`).then(
      (success) => {
        console.log(success.data.message);
        list_users();

      },
      (error) => {
        console.log(error);

      }
    );
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
  //   a.download = "utilisateurs.csv";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  //Retrouver le role par son id
  const getRoleNameById = (id) => roles.find(r => r.id === id)?.name || "";


  
  


  return (
    <div className="utilisateurs-page">
      <h1>Gestion des Utilisateurs 👥</h1>
      <div className="utilisateurs-container wide">
        <div className="search-bar">
          <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={handleSearch} />
        </div>

        <div className="actions">
          <button onClick={openModal} className="add-button">
            <FaPlus /> Ajouter un Utilisateur
          </button>
          {/* <button className="export-button" onClick={exportToCSV}>
            Exporter en CSV
          </button> */}
        </div>

        {/* Tableau des utilisateurs */}
        <div className="utilisateurs-table">
          <div className="table-header">
            <div className="header-cell">Nom & Prénom</div>
            <div className="header-cell">Email</div>
            <div className="header-cell">Téléphone</div>
            <div className="header-cell">Statut</div>
            <div className="header-cell">Actions</div>
          </div>
          {loadingList ? (
            <div className="spinner-container">
              <Spin size="large" tip="Chargement des utilisateurs..." />
            </div>
          ) : (
            currentItems.map((user) => (
              <div key={user.id} className="table-row">
                <div className="row-cell"><FaUser /> {user.first_name} {user.last_name}</div>
                <div className="row-cell"><FaEnvelope /> {user.email}</div>
                <div className="row-cell"><FaPhone /> {user.phone}</div>
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
            )))
            }
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
          title={isEditing ? "Modifier un Utilisateur" : "Ajouter un Utilisateur"}
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
        >
          <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
            <Form layout="vertical">
              <Form.Item label="Rôle" required>
                <Select
                  placeholder="Choisir un rôle"
                  value={newUser.roles}
                  onChange={(value) => setNewUser({ ...newUser, roles: value })}
                >
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>{role.name}</Option>
                  ))}
                </Select>
              </Form.Item>

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

              <Form.Item label="Téléphone" required>
                <Input
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                />
              </Form.Item>


              {/* Champs dynamiques selon le rôle */}
              {getRoleNameById(newUser.roles)?.toLowerCase() === "student" && (
                <>
                  <Form.Item label="Filière">
                    <Select
                      value={newUser.filiere}
                      onChange={(value) => setNewUser({ ...newUser, filiere: value })}
                    >
                      {filieres.map((f) => (
                        <Option key={f.id} value={f.id}>{f.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Classe">
                    <Select
                      value={newUser.classe}
                      onChange={(value) => setNewUser({ ...newUser, classe: value })}
                    >
                      {classes.map((c) => (
                        <Option key={c.id} value={c.id}>{c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Photo">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => setPhoto(e.target.files[0])}
                    />
                  </Form.Item>
                </>
              )}

              {getRoleNameById(newUser.roles)?.toLowerCase() === "professor" && (
                <Form.Item label="Modules">
                  <Select
                    mode="multiple" // ✅ autorise la sélection multiple
                    value={newUser.modules}
                    onChange={(value) => setNewUser({ ...newUser, modules: value })}
                    placeholder="Choisir un ou plusieurs modules"
                  >
                    {modules.map((m) => (
                      <Option key={m.id} value={m.id}>{m.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              
              )}

              {getRoleNameById(newUser.roles)?.toLowerCase() === "personnel" && (
                <Form.Item label="Fonction">
                  <Select
                    value={newUser.fonction}
                    onChange={(value) => setNewUser({ ...newUser, fonction: value })}
                    
                  >
                    <Option value="">-- Choisir une fonction --</Option>
                    {fonctions.map((fct, index) => (
                      <Option key={index} value={fct}>{fct}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

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

export default Utilisateur;