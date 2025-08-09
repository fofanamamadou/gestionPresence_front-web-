import React, { useState, useEffect } from "react";
import axios from "../AxiosInstance/axiosInstance"; //  On utilise axiosInstance.js
import { Modal, Form, Input, Select, TimePicker, message, Row, Card, Col, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { FaClock, FaPlus, FaCalendarAlt } from "react-icons/fa";
import "./Horaires.css";

const { Option } = Select;

const Horaires = () => {
  const [form] = Form.useForm();
  const [horaires, setHoraires] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedHoraire, setSelectedHoraire] = useState(null);


  const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const salleClasse = ["Salle I", "Salle II", "Salle III", "Salle IV", "Salle V", "Salle VI", "Salle informatique"];

  // Récupérer les horaires depuis le backend 
  useEffect(() => {
    list_horaires();
    list_modules();
  }, []);

  //Liste des horaires
  const list_horaires = () => {
  setLoadingList(true);
  axios.get("horaires").then(
    (success) => {
      setHoraires(success.data);
      setLoadingList(false);
    },
    (error) => {
      console.log(error);
      setHoraires([]);
      setLoadingList(false);
    }
  );
};

  //Pour recuperer la liste des classes
  const list_modules = () => {
    axios.get("modules").then(
      (success) => {
        console.log(success);
        console.log(filteredHoraires);
        setModules(success.data);

      },

      (error) => {
        console.log(error)
        setModules([]);

      }
      )

  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };
  const openEditModal = (horaire) => {
    setIsEditing(true);
    form.setFieldsValue({
      jour: horaire.jours,
      heureDebut: moment(horaire.time_start_course, "HH:mm"),
      heureFin: moment(horaire.time_end_course, "HH:mm"),
      module: horaire.module_details.id,
      salle: horaire.salle,
    });
    setSelectedHoraire(horaire);
    setIsModalOpen(true);
  };
  

  //Gestion de la recherche
  const handleSearch = (e) => setSearchQuery(e.target.value);

  //Ajout et modification
 const handleSubmitHoraire = async () => {
  try {
    setLoadingSubmit(true);
    const values = await form.validateFields();

    if (values.heureDebut.isAfter(values.heureFin)) {
      message.error("L'heure de début doit être avant l'heure de fin");
      setLoadingSubmit(false);
      return;
    }

    const data = {
      jours: values.jour,
      time_start_course: values.heureDebut.format("HH:mm"),
      time_end_course: values.heureFin.format("HH:mm"),
      module: values.module,
      salle: values.salle,
    };

    if (isEditing && selectedHoraire) {
      await axios.put(`horaires/${selectedHoraire.id}`, data);
      message.success("Horaire modifié avec succès !");
    } else {
      await axios.post("horaires", data);
      message.success("Horaire ajouté avec succès !");
    }

    list_horaires();
    closeModal();
  } catch (err) {
    console.error("Erreur lors de l'envoi :", err);
    message.error(err.response?.data?.message || "Erreur dans le formulaire ou lors de l'envoi.");
  } finally {
    setLoadingSubmit(false);
  }
};

  


  //Fonction pour supprimer
  const handleDeleteHoraire = (id) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet horaire ?");
    if (isConfirmed) {
      axios.delete(`horaires/${id}`).then(
        () => {
          message.success("Horaire supprimé avec succès !");
          list_horaires();
        },
        () => {
          message.error("Erreur lors de la suppression de l'horaire.");
        }
      );
    } else {
      message.info("Suppression annulée.");
    }
  };
  
  
  

  const filteredHoraires = horaires.filter((horaire) =>
    horaire.jours.toLowerCase().includes(searchQuery.toLowerCase()) ||
    horaire.module_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    horaire.salle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="horaires-page">
      <h1>Gestion des Horaires <FaClock /></h1>
      <div className="horaires-container">
          {/* Search Bar */}
          <div className="search-bar">
            <input type="text" placeholder="Rechercher par jour, module ou salle..." value={searchQuery} onChange={handleSearch} />
            <span className="search-icon">🔍</span>
          </div>

        <div className="actions">
          <button onClick={openModal} className="add-button">
            <FaPlus /> Ajouter une Horaire
          </button>
          {/* <button className="export-button" onClick={exportToCSV}>
            Exporter en CSV
          </button> */}
        </div>

        {loadingList ? (
          <div className="spinner-container">
            <Spin size="large" tip="Chargement des horaires..." />
          </div>
        ) : (
          <Row gutter={[20, 20]} justify="center" className="horaires-grid">
            {filteredHoraires.slice().reverse().map((horaire) => (
              <Col key={horaire.id}>
                <Card
                  onClick={() => openEditModal(horaire)}
                  className="horaire-card"
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
                      onClick={() => handleDeleteHoraire(horaire.id)}
                      style={{
                        fontSize: 18,
                        color: "#ff4d4f",
                        cursor: "pointer",
                      }}
                    />
                  </div>

                <FaCalendarAlt className="horaire-icon" />
                <h3>{horaire.jours}</h3>
                <p><strong>Module:</strong> {horaire.module_details?.name || "Inconnu"}</p>
                <p><strong>Heure:</strong> {horaire.time_start_course} - {horaire.time_end_course}</p>
                <p><strong>Salle:</strong> {horaire.salle}</p>

                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal Ant Design */}
        <Modal 
          title={isEditing ? "Modifier un Horaire" : "Ajouter un Horaire"}
          open={isModalOpen} 
          onCancel={closeModal}
          okText={isEditing ? "Modifier" : "Ajouter"}
          cancelText="Annuler"
          footer={null}
        >
          <Spin spinning={loadingSubmit} tip="Enregistrement en cours...">
            <Form layout="vertical" form={form}>
              <Form.Item name="jour" label="Jour" rules={[{ required: true }]}>
                <Select placeholder="Choisir un jour">
                  {joursSemaine.map((jour) => (
                    <Option key={jour} value={jour}>{jour}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="heureDebut" label="Heure de début" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" />
              </Form.Item>

              <Form.Item name="heureFin" label="Heure de fin" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" />
              </Form.Item>

              <Form.Item label="Module" name="module">
                <Select
                  placeholder="Choisir un module"
                >
                  {modules.map((m) => (
                    <Option key={m.id} value={m.id}>{m.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="salle" label="Salle" rules={[{ required: true }]}>
                <Select placeholder="Choisir un salle">
                  {salleClasse.map((salle) => (
                    <Option key={salle} value={salle}>{salle}</Option>
                  ))}
                </Select>
              </Form.Item>
              {/* Boutons personnalisés */}
              <div className="modal-buttons">
                <button type="button" onClick={closeModal} disabled={loadingSubmit}>Annuler</button>
                <button
                  type="button"
                  onClick={handleSubmitHoraire}
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

export default Horaires;
