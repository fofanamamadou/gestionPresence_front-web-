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
  Spin
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, BookOutlined, DeleteOutlined } from "@ant-design/icons";

import { FaBook, FaPlus, FaChalkboardTeacher } from "react-icons/fa";
import axios from "../utils/axiosInstance";

const { Title, Text } = Typography;
const { Option } = Select;

const Modules = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [selectedModule, setSelectedModule] = useState(null); // module à modifier
  const [isEditing, setIsEditing] = useState(false); // mode édition
  const [modules, setModules] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const sessions = ["S1", "S2", "S3", "S4", "S5", "S6"];

  useEffect(() => {
    list_modules();
    list_filieres();
    list_classes();
  }, []);

  const openModal = () => setIsModalOpen(true);

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

  const list_modules = () => {
    setLoadingList(true);
    axios.get("modules").then(
      (res) => {
        setModules(res.data);
        setLoadingList(false);
      },
      () => {
        setModules([]);
        setLoadingList(false);
      }
    );
  };

  const list_filieres = () => {
    axios.get("filieres").then(
      (res) => setFilieres(res.data),
      () => setFilieres([])
    );
  };

  const list_classes = () => {
    axios.get("classes").then(
      (res) => setClasses(res.data),
      () => setClasses([])
    );
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleSubmitModule = async () => {
    try {
      setLoadingSubmit(true);
      const values = await form.validateFields();

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

      if (isEditing) {
        await axios.put(`modules/${selectedModule.id}`, formattedModule);
        message.success("Module modifié avec succès !");
      } else {
        await axios.post("modules", formattedModule);
        message.success("Module ajouté avec succès !");
      }

      list_modules();
      closeModal();
    } catch (err) {
      console.error("Erreur dans le formulaire ou envoi :", err);
      message.error(err.response?.data?.message || "Erreur lors de l'enregistrement du module.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Supprimer un module
  const handleDeleteModule = (id) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?");
    if (isConfirmed) {
      axios.delete("modules/"+id).then(
        () => {
          message.success("Module supprimé avec succès !");
          list_modules();
        },
        () => {
          message.error("Erreur lors de la suppression du module.");
        }
      );
    }
    else {
      message.info("Suppression annulée.");
    }
  };
  
  const filteredModules = modules.filter((mod) =>
    mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.session.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modules-page">
      <h1>Gestion des Modules 📚</h1>
      <div className="modules-container">
        {/* Search Bar */}
        <div className="search-bar">
          <input type="text" placeholder="Rechercher par module, professeur, filière ou session..." value={searchQuery} onChange={handleSearch} />
          <span className="search-icon">🔍</span>
        </div>

        {/* Action Button */}
        <div className="actions">
          <button onClick={openModal} className="add-button">
            <FaPlus /> Ajouter un Module
          </button>
        </div>

        {loadingList ? (
          <div className="spinner-container">
            <Spin size="large" tip="Chargement des modules..." />
          </div>
        ) : (
          <Row gutter={[20, 20]} justify="center" className="modules-grid">
            {filteredModules.slice().reverse().map((mod) => (
              <Col key={mod.id}>
                <Card
                  onClick={() => openEditModal(mod)}
                  className="module-card"
                  style={{
                    width: 250,
                    position: "relative",
                  }}
                >
                  {/* Supprimer */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 1,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DeleteOutlined
                      onClick={() => handleDeleteModule(mod.id)}
                      style={{
                        fontSize: 18,
                        color: "#ff4d4f",
                        cursor: "pointer",
                      }}
                    />
                  </div>

                  <FaBook className="module-icon" />
                  <h3>{mod.name}</h3>
                  <p><FaChalkboardTeacher /> <strong>Classe:</strong> {mod.classe_details?.name}</p>
                  <p><strong>Session:</strong> {mod.session}</p>
                  <p><strong>Filières:</strong> {mod.filieres_details?.map((f) => f.name).join(", ") || "Aucune"}</p>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          title={isEditing ? "Modifier un Module" : "Ajouter un Module"}
          open={isModalOpen}
          onCancel={closeModal}
          okText={isEditing ? "Modifier" : "Ajouter"}
          cancelText="Annuler"
          footer={null}
        >
          <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input />
              </Form.Item>

              <Form.Item name="start_date" label="Date de début" rules={[{ required: true }]}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="end_date" label="Date de fin" rules={[{ required: true }]}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="classe" label="Classe" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner une classe">
                  {classes.map((classe) => (
                    <Option key={classe.id} value={classe.id}>{classe.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="filieres" label="Filières" rules={[{ required: true }]}>
                <Select
                  mode="multiple"
                  placeholder="Sélectionner une ou plusieurs filières"
                >
                  {filieres.map((filiere) => (
                    <Option key={filiere.id} value={filiere.id}>{filiere.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="session" label="Session" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner une session">
                  {sessions.map((session) => (
                    <Option key={session} value={session}>{session}</Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Boutons personnalisés */}
              <div className="modal-buttons">
                <button type="button" onClick={closeModal} disabled={loadingSubmit}>Annuler</button>
                <button
                  type="button"
                  onClick={handleSubmitModule}
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

export default Modules;
