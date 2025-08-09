import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Spin } from "antd";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import axios from "../utils/axiosInstance";

import { useErrorHandler } from '../utils/errorHandler';

const Filiere = () => {
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [filieres, setFilieres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { handleError } = useErrorHandler();

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filieres.length / itemsPerPage);

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      const response = await axios.get("filieres/");
      setFilieres(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredFilieres = filieres.filter((filiere) =>
    filiere.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filiere.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFilieres.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditMode(false);
    form.resetFields();
  };

  const openEditModal = (filiere) => {
    setIsModalOpen(true);
    setEditMode(true);
    setEditId(filiere.id);
    form.setFieldsValue({
      name: filiere.name,
      description: filiere.description,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editMode) {
        await axios.put(`filieres/${editId}`, values);
        message.success("Filière modifiée avec succès !");
      } else {
        await axios.post("filieres/", values);
        message.success("Filière créée avec succès !");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchFilieres();
    } catch (error) {
      handleError(error);
    }
  };

  const deleteFiliere = async (id) => {
    try {
      await axios.delete(`filieres/${id}`);
      message.success("Filière supprimée avec succès !");
      fetchFilieres();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="filiere-page">
      <h1>Gestion des Filières 📚</h1>
      <div className="filiere-container">
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
            <FaPlus /> Ajouter une filière
          </button>
        </div>

        <div className="filiere-table">
          <div className="table-header">
            <div className="header-cell">Nom</div>
            <div className="header-cell">Description</div>
            <div className="header-cell">Actions</div>
          </div>
          {loadingList ? (
            <div className="spinner-container">
              <Spin size="large" tip="Chargement des filières..." />
            </div>
          ) : (
            currentItems.map((filiere) => (
              <div key={filiere.id} className="table-row">
                <div className="row-cell filiere-name">{filiere.name}</div>
                <div className="row-cell">{filiere.description}</div>
                <div className="row-cell actions-cell">
                  <FaEdit className="edit-icon" onClick={() => openEditModal(filiere)} />
                  <FaTrash className="delete-icon" onClick={() => deleteFiliere(filiere.id)} />
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
        title={editMode ? "Modifier une filière" : "Ajouter une filière"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nom de la filière"
              name="name"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Description de la filière"
              name="description"
            >
              <Input />
            </Form.Item>
            {/* Boutons personnalisés */}
            <div className="modal-buttons">
              <button type="button" onClick={closeModal} disabled={loadingSubmit}>Annuler</button>
              <button
                type="button"
                onClick={handleSubmit}
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

export default Filiere;
