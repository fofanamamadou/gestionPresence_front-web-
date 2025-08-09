import React, { useState } from "react";

import { FaPlus, FaTrash, FaEdit, FaSearch} from "react-icons/fa";
import { useEffect } from "react";
import { Modal, Form, Input, message,Button, Spin } from "antd";
import axios from "../utils/axiosInstance"; //  On utilise axiosInstance.js

const Classe = () => {

  const [classes, setClasses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form] = Form.useForm();

  // Pagination states
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(classes.length / itemsPerPage);

  // Gestion de la recherche
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtrer les classes
  const filteredClasses = classes.filter((classe) =>
    classe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  


  useEffect( () => {
    list_classes();

  }, []);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Gestion de la modale
  const openModal = () => {
    setIsModalOpen(true);
    setEditMode(false);
    form.resetFields();
  };


  

  //Pour recuperer la liste des classes
  const list_classes = () => {
    setLoadingList(true);
    axios.get("classes").then(
      (success) => {
        setClasses(success.data);
        setLoadingList(false);
      },
      (error) => {
        console.log(error);
        setClasses([]);
        setLoadingList(false);
      }
    );
  };


  const openEditModal = (classe) => {
    setIsModalOpen(true);
    setEditMode(true);
    setEditId(classe.id);
    form.setFieldsValue({
      name: classe.name,
      description: classe.description,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditMode(false);
  };

  // Ajouter / Modifier une classe
  const handleSaveClasse = () => {
    form.validateFields().then((values) => {
      setLoadingSubmit(true);
      if (editMode) {
        axios.put(`classes/${editId}`, values).then(
          (res) => {
            setClasses(classes.map(c => (c.id === editId ? res.data : c)));
            message.success("Classe modifiée !");
            closeModal();
            setLoadingSubmit(false);
          },
          (err) => {
            message.error("Une erreur s'est produite.");
            setLoadingSubmit(false);
          }
        );
      } else {
        axios.post("classes", values).then(
          (res) => {
            setClasses([...classes, res.data]);
            message.success("Classe ajoutée !");
            closeModal();
            setLoadingSubmit(false);

          },
          (err) => {
            console.error(err);
            setLoadingSubmit(false);
            message.error("Erreur survenu");
          }
        );
      }
    });
  };


  // Supprimer une classe
  const deleteClasse = (id) => {
    axios.delete("classes/"+id).then(
      (success) => {
        console.log(success);
        setClasses(classes.filter((classe) => classe.id !== id));
        closeModal();

      },

      (error) => {
        console.log(error)

      }
      )
    // Si la dernière item de la dernière page est supprimée, revenir à la page précédente
    if (classes.length % itemsPerPage === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="classe-page">
      <h1>Gestion des Classes 📚</h1>
      <div className="classe-container">
        {/* Barre de recherche */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher par nom ou description..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Boutons d'action */}
        <div className="actions">
          <button onClick={openModal} className="add-button">
            <FaPlus /> Ajouter une classe
          </button>
        </div>

        {/* Tableau des classes */}
        <div className="classe-table">
          <div className="table-header">
            <div className="header-cell">Nom</div>
            <div className="header-cell">Description</div>
            <div className="header-cell">Actions</div>
          </div>
          {loadingList ? (
            <div className="spinner-container">
              <Spin size="large" tip="Chargement des classes..." />
            </div>
          ) : (
            currentItems.map((classe) => (
              <div key={classe.id} className="table-row">
                <div className="row-cell class-name">{classe.name}</div>
                <div className="row-cell">{classe.description}</div>
                <div className="row-cell actions-cell">
                  <FaEdit className="edit-icon" onClick={() => openEditModal(classe)} />
                  <FaTrash className="delete-icon" onClick={() => deleteClasse(classe.id)} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pagination">
          <Button onClick={prevPage} disabled={currentPage === 1}>
            ◀ Précédent
          </Button>
          <span>Page {currentPage} sur {totalPages}</span>
          <Button onClick={nextPage} disabled={currentPage === totalPages}>
            Suivant ▶
          </Button>
        </div>
      </div>

      {/* Modal Ant Design */}
      <Modal
        title={editMode ? "Modifier une classe" : "Ajouter une classe"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nom de la classe"
              name="name"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Description de la classe"
              name="description"
            >
              <Input />
            </Form.Item>
            {/* Boutons personnalisés */}
            <div className="modal-buttons">
              <button type="button" onClick={closeModal} disabled={loadingSubmit}>Annuler</button>
              <button
                type="button"
                onClick={handleSaveClasse}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <Spin size="small" style={{ color: "white" }} />
                ) : (
                  editMode ? "Modifier" : "Ajouter"
                )}
              </button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default Classe;