import React, { useState, useEffect, useCallback } from "react";
import "./Planning.css";
import { Modal, Form, Input, Select, message, Button, DatePicker, TimePicker, InputNumber, Spin } from "antd";
import { FaPlus, FaToggleOn, FaToggleOff, FaCheck, FaClock, FaExclamationCircle, FaFilter, FaTimes } from "react-icons/fa";
import dayjs from "dayjs";
import axios from "../AxiosInstance/axiosInstance"; //  On utilise axiosInstance.js
import { useErrorHandler } from '../utils/errorHandler';

export default function Planning() {
  const initialCour = {
    user: null,
    module: null,
    horaire: null,
    date: "",
    his_state: false
  };
  const { Option } = Select;
  const [cours, setCours] = useState([]);
  const [modules, setModules] = useState([]);

  //Pour les modules d'un certains prof
  const [modulesProf, setModulesProf] = useState([]);

  const [professeurs, setProfesseurs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCour, setNewCour] = useState(initialCour);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState(1); // Nombre de semaines
  const [selectedDay, setSelectedDay] = useState(null);
  const [horaires, setHoraires] = useState([]); // Pour stocker les horaires

  // États pour le filtrage
  const [filters, setFilters] = useState({
    search: "",
    professeur: null,
    modules: [],
    validationStatus: null // Ajout du filtre de validation
  });

  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingHoraires, setIsLoadingHoraires] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Options pour le filtre de validation
  const validationOptions = [
    { 
      value: 'pending_validation', 
      label: 'En attente de validation', 
      description: 'Cours effectués mais non validés',
      icon: <FaClock style={{ color: '#ffc107' }} />,
      color: '#fff8e6'
    },
    { 
      value: 'validated', 
      label: 'Validés', 
      description: 'Cours validés',
      icon: <FaCheck style={{ color: '#28a745' }} />,
      color: '#f0f9f1'
    },
    { 
      value: 'not_done', 
      label: 'Non effectués', 
      description: 'Cours à venir',
      icon: <FaExclamationCircle style={{ color: '#dc3545' }} />,
      color: '#fdf3f3'
    }
  ];

  const { handleError } = useErrorHandler();

  useEffect(() => {
    list_plannings();
    list_modules();
    list_professeurs();
  }, []);

  //Empecher l'affiche du bouton modifier apres validation du cours
  const isEditable = (cour) => {
    return !cour.his_state; // uniquement si le cours n'est pas validé
  };

  // Filtrer les Cours
  const filteredCours = cours.filter((cour) => {
    const fullName = `${cour.user_details?.first_name || ""} ${cour.user_details?.last_name || ""}`.toLowerCase();
    const moduleName = cour.module_details?.name?.toLowerCase() || "";
    
    // Filtre de recherche
    const searchMatch = filters.search === "" || 
      fullName.includes(filters.search.toLowerCase()) || 
      moduleName.includes(filters.search.toLowerCase());

    // Filtre par professeur
    const profMatch = !filters.professeur || cour.user === filters.professeur;

    // Filtre par modules
    const moduleMatch = filters.modules.length === 0 || filters.modules.includes(cour.module);

    // Filtre par état de validation
    let validationMatch = true;
    if (filters.validationStatus) {
      switch (filters.validationStatus) {
        case 'pending_validation':
          validationMatch = cour.his_state && !cour.validate;
          break;
        case 'validated':
          validationMatch = cour.validate;
          break;
        case 'not_done':
          validationMatch = !cour.his_state;
          break;
        default:
          validationMatch = true;
      }
    }

    return searchMatch && profMatch && moduleMatch && validationMatch;
  });

  // Pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredCours.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCours.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCour(initialCour);
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCour({ ...newCour, [name]: value });
  };

  // Gestion de la recherche
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // Ouvrir & fermer le modal
  const openModal = () => setIsModalOpen(true);

  //Fonction pour exporter en CSV
  const exportToCSV = () => {
    const headers = ["Professeur", "Module", "Date", "Heure Début", "Heure Fin", "Salle", "Statut"];
    
    const rows = filteredCours.map(cour => [
      cour.user_details ? `${cour.user_details.first_name} ${cour.user_details.last_name}` : "Inconnu",
      cour.module_details ? cour.module_details.name : "Inconnu",
      cour.date,
      cour.time_start_course,
      cour.time_end_course,
      cour.salle,
      cour.his_state ? "Validé" : "Non Validé"
    ]);
  
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "planning_cours.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  //Recuperer les modules d'un certain professeur 
  const fetchModulesByProfesseur = async (profId) => {
    if (!profId) {
      setModulesProf([]);
      return;
    }
    
    setIsLoadingModules(true);
    try {
      const response = await axios.get(`professeurs/${profId}/modules/`);
      setModulesProf(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des modules du professeur :", err);
      setModulesProf([]);
      message.error("Erreur lors du chargement des modules");
    } finally {
      setIsLoadingModules(false);
    }
  };
  


  //Pour recuperer la liste des cours
  const list_plannings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("plannings");
      setCours(response.data);
    } catch (error) {
      console.log(error);
      setCours([]);
      message.error("Erreur lors du chargement des plannings");
    } finally {
      setIsLoading(false);
    }
  };

  //Liste des modules
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
  //Liste des modules
  const list_professeurs = () => {
    axios.get("users/professors").then(
      (success) => {
        console.log(success);
        setProfesseurs(success.data);

      },

      (error) => {
        console.log(error)
        setProfesseurs([]);

      }
      )

  };

  // Fonction pour récupérer les horaires d'un module
  const fetchHorairesByModule = async (moduleId) => {
    if (!moduleId) {
      setHoraires([]);
      return;
    }

    setIsLoadingHoraires(true);
    try {
      const response = await axios.get(`horaires/module/${moduleId}/`);
      setHoraires(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des horaires:", err);
      setHoraires([]);
      message.error("Erreur lors du chargement des horaires");
    } finally {
      setIsLoadingHoraires(false);
    }
  };

  // Fonction pour générer les dates des cours sur plusieurs semaines
  const generateCourseDates = (startDate, selectedDay, numberOfWeeks) => {
    const dates = [];
    const startMoment = dayjs(startDate);
    
    // Trouver le prochain jour correspondant
    let nextDate = startMoment.day(getDayNumber(selectedDay));
    if (nextDate.isBefore(startMoment)) {
      nextDate = nextDate.add(1, 'week');
    }

    // Générer les dates pour le nombre de semaines spécifié
    for (let i = 0; i < numberOfWeeks; i++) {
      dates.push(nextDate.add(i, 'week').format('YYYY-MM-DD'));
    }

    return dates;
  };

  // Fonction pour convertir le jour en numéro
  const getDayNumber = (day) => {
    const days = {
      'Lundi': 1,
      'Mardi': 2,
      'Mercredi': 3,
      'Jeudi': 4,
      'Vendredi': 5,
      'Samedi': 6,
      'Dimanche': 0
    };
    return days[day];
  };

  // Modification de la fonction saveCour pour gérer plusieurs semaines
  const saveCour = async () => {
    if (!newCour.horaire || !duration) {
      message.error("Veuillez sélectionner un horaire et une durée");
      return;
    }

    const selectedHoraire = horaires.find(h => h.id === newCour.horaire);
    if (!selectedHoraire) {
      message.error("Horaire non trouvé");
      return;
    }

    const dates = generateCourseDates(dayjs(), selectedHoraire.jours, duration);
    
    setIsSaving(true);
    try {
      const promises = dates.map(date => {
        const courData = {
          ...newCour,
          date: date
        };
        return axios.post("plannings", courData);
      });

      await Promise.all(promises);
      message.success(`${dates.length} cours ajoutés avec succès !`);
      await list_plannings();
      closeModal();
    } catch (error) {
      console.error("Erreur lors de l'opération", error);
      message.error("Une erreur est survenue lors de l'ajout des cours");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidation = async (planningId) => {
    setIsValidating(true);
    try {
      await axios.put(`plannings/admin/valider/${planningId}/`);
      message.success("Cours validé avec succès !");
      await list_plannings();
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      message.error(error.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setIsValidating(false);
    }
  };

  const ValidationButton = ({ cours }) => {
    if (cours.validate) {
      return (
        <div className="validation-status validated">
          <FaCheck style={{ color: '#28a745', fontSize: '20px' }} />
        </div>
      );
    }

    if (!cours.his_state) {
      return (
        <button 
          className="validation-button disabled"
          disabled
          title="Le cours doit d'abord être marqué comme effectué"
        >
          <FaExclamationCircle style={{ marginRight: '5px' }} />
          En attente du cours
        </button>
      );
    }

    return (
      <button 
        className="validation-button pending"
        onClick={() => handleValidation(cours.id)}
      >
        <FaClock style={{ marginRight: '5px' }} />
        Valider le cours
      </button>
    );
  };

  // Fonction pour mettre à jour les filtres
  const updateFilters = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      search: "",
      professeur: null,
      modules: [],
      validationStatus: null
    });
  };

  // Effet pour charger les modules quand un professeur est sélectionné
  useEffect(() => {
    if (filters.professeur) {
      fetchModulesByProfesseur(filters.professeur);
    } else {
      setModulesProf([]);
    }
  }, [filters.professeur]);

  return (
    <div className="planning-page">
      <h1>Planning des Cours 🗓️</h1>
      <div className="planning-container">
        <div className="filters-section">
          <div className="search-bar">
            <Input
              placeholder="Rechercher un professeur ou un module..."
              value={filters.search}
              onChange={(e) => updateFilters('search', e.target.value)}
              prefix={<FaFilter style={{ color: '#8c8c8c' }} />}
              allowClear
            />
          </div>
          
          <div className="filters-bar">
            <Select
              placeholder="Filtrer par Professeur"
              value={filters.professeur}
              onChange={(value) => updateFilters('professeur', value)}
              style={{ width: 250 }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {professeurs.map((prof) => (
                <Select.Option key={prof.id} value={prof.id}>
                  {prof.first_name} {prof.last_name}
                </Select.Option>
              ))}
            </Select>

            <Select
              mode="multiple"
              placeholder="Filtrer par Module"
              value={filters.modules}
              onChange={(values) => updateFilters('modules', values)}
              style={{ width: 300 }}
              allowClear
              disabled={!filters.professeur}
              maxTagCount={2}
            >
              {modulesProf.map((module) => (
                <Select.Option key={module.id} value={module.id}>
                  {module.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="État de validation"
              value={filters.validationStatus}
              onChange={(value) => updateFilters('validationStatus', value)}
              style={{ width: 250 }}
              allowClear
              optionLabelProp="label"
              className="validation-select"
              dropdownStyle={{ padding: '8px' }}
            >
              {validationOptions.map((option) => (
                <Select.Option 
                  key={option.value} 
                  value={option.value}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {option.icon}
                      {option.label}
                    </div>
                  }
                >
                  <div
                    className="validation-option"
                    style={{
                      padding: '8px 12px',
                      margin: '-4px -8px',
                      borderRadius: '6px',
                      backgroundColor: option.color,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      {option.icon}
                      <span style={{ fontWeight: 500 }}>{option.label}</span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      marginLeft: '24px'
                    }}>
                      {option.description}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>

            {(filters.search || filters.professeur || filters.modules.length > 0 || filters.validationStatus) && (
              <button 
                className="filter-button reset"
                onClick={resetFilters}
              >
                <FaTimes style={{ marginRight: '5px' }} />
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {filteredCours.length === 0 ? (
            <div className="no-results">
              <p>Aucun cours ne correspond aux critères de recherche</p>
            </div>
          ) : (
            <div className="filter-summary">
              {filteredCours.length} cours trouvé{filteredCours.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="actions">
          <button onClick={openModal} className="add-button">
            <FaPlus /> Ajouter un Cours
          </button>
          <button onClick={exportToCSV} className="csv-button">
            📄 Exporter en CSV
          </button>

        </div>

        <div className="cours-table">
          {isLoading ? (
            <div className="spinner-container">
              <Spin size="large" tip="Chargement des plannings..." />
            </div>
          ) : (
            <>
              <div className="table-header">
                <div className="header-cell">Professeur</div>
                <div className="header-cell">Module</div>
                <div className="header-cell">Date</div>
                <div className="header-cell">Horaire</div>
                <div className="header-cell">Statut</div>
                <div className="header-cell">Validation</div>
              </div>

              {currentItems.map((c) => (
                <div key={c.id} className="table-row">
                  <div className="row-cell">
                    {c.user_details ? `${c.user_details.first_name} ${c.user_details.last_name}` : "Inconnu"}
                  </div>
                  <div className="row-cell">
                    {c.module_details ? (
                      <div>
                        <div>{c.module_details.name}</div>
                        <small style={{ color: '#666' }}>
                          {c.module_details.classe_details?.name || ""}
                        </small>
                      </div>
                    ) : "Inconnu"}
                  </div>
                  <div className="row-cell">{dayjs(c.date).format('DD/MM/YYYY')}</div>
                  <div className="row-cell">
                    {c.horaire_details ? (
                      <>
                        {c.horaire_details.time_start_course.slice(0, 5)} - {c.horaire_details.time_end_course.slice(0, 5)}
                        <br />
                        <small style={{ color: '#666' }}>
                          {c.horaire_details.jours} - Salle: {c.horaire_details.salle}
                        </small>
                      </>
                    ) : "Horaire non défini"}
                  </div>
                  <div className="row-cell">
                    {c.his_state ? (
                      <span style={{ color: '#28a745', fontWeight: 600 }}>✅ Effectué</span>
                    ) : (
                      <span style={{ color: '#dc3545', fontWeight: 600 }}>🔴 Non effectué</span>
                    )}
                  </div>
                  <div className="row-cell">
                    <ValidationButton cours={c} />
                  </div>
                </div>
              ))}
            </>
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
          title="Ajouter un Cours"
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
        >
          <Spin spinning={isSaving} tip="Enregistrement en cours...">
            <Form layout="vertical">
              <Form.Item label="Professeur" rules={[{ required: true }]}>
                <Select 
                  placeholder="Sélectionner un professeur" 
                  value={newCour.user}
                  onChange={(value) => {
                    setNewCour({ ...newCour, user: value });
                    fetchModulesByProfesseur(value);
                  }}
                >
                  {professeurs.map((prof) => (
                    <Option key={prof.id} value={prof.id}>
                      {prof.first_name} {prof.last_name} - {prof.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Module" rules={[{ required: true }]}>
                <Select 
                  value={newCour.module} 
                  placeholder="Sélectionner un module"
                  disabled={!newCour.user}
                  loading={isLoadingModules}
                  onChange={(value) => {
                    setNewCour({ ...newCour, module: value });
                    fetchHorairesByModule(value);
                  }}
                >
                  {modulesProf.map((module) => (
                    <Option key={module.id} value={module.id}>{module.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Horaire" rules={[{ required: true }]}>
                <Select
                  value={newCour.horaire}
                  placeholder="Sélectionner un horaire"
                  disabled={!newCour.module}
                  loading={isLoadingHoraires}
                  style={{ width: '100%' }}
                  optionLabelProp="label"
                  onChange={(value) => {
                    const horaire = horaires.find(h => h.id === value);
                    setNewCour({ ...newCour, horaire: value });
                    setSelectedDay(horaire?.jours);
                  }}
                >
                  {horaires.map((horaire) => (
                    <Option 
                      key={horaire.id} 
                      value={horaire.id}
                      label={`${horaire.jours} ${horaire.time_start_course.slice(0, 5)} - ${horaire.time_end_course.slice(0, 5)}`}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 500 }}>
                          {horaire.jours} {horaire.time_start_course.slice(0, 5)} - {horaire.time_end_course.slice(0, 5)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666',
                          whiteSpace: 'normal',
                          lineHeight: '1.2'
                        }}>
                          Salle: {horaire.salle}
                          {horaire.module_details?.classe_details?.name && 
                            ` • ${horaire.module_details.classe_details.name}`}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Durée (en semaines)" rules={[{ required: true }]}>
                <InputNumber
                  min={1}
                  max={52}
                  value={duration}
                  onChange={(value) => setDuration(value)}
                />
              </Form.Item>

              <div className="modal-buttons">
                <button type="button" onClick={closeModal} disabled={isSaving}>Annuler</button>
                <button type="button" onClick={saveCour} disabled={isSaving}>
                  {isSaving ? "Ajout en cours..." : "Ajouter"}
                </button>
              </div>
            </Form>
          </Spin>
        </Modal>
      </div>
    </div>
  );
};

