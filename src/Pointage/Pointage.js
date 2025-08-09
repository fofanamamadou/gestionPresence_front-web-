import React, { useState, useEffect } from "react";
import "./Pointage.css";
import { FaRegSmileBeam, FaCalendarAlt, FaUsers, FaDownload, FaSync, FaFilter } from "react-icons/fa";
import { DatePicker, Select, Button, Modal, Table, Tag, Card, Statistic, Row, Col, Input, message } from "antd";
import axiosInstance from "../AxiosInstance/axiosInstance";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Pointage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pointages, setPointages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ présents: 0, absents: 0, total: 0 });

  // Charger les données au montage du composant
  useEffect(() => {
    loadPointages();
  }, []);

  // Charger les pointages depuis l'API
  const loadPointages = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('presences/');
      let data = response.data;
      
      // Transformer les données selon le format attendu
      if (data && data.length > 0) {
        data = data.map(item => ({
          id: item.id,
          nom: `${item.user.first_name} ${item.user.last_name}`,
          email: item.user.email,
          classe: item.user.classe || 'N/A',
          filiere: item.user.filiere || 'N/A',
          heure: moment(item.timestamp).format('HH:mm'),
          date: moment(item.timestamp).format('DD/MM/YYYY'),
          statut: 'Présent',
          session_id: item.session.id,
          session_code: item.session.code
        }));
      } else {
        // Aucune donnée disponible
        data = [];
      }
      
      setPointages(data);
      calculateStats(data);
      message.success(`${data.length} présences chargées avec succès`);
    } catch (error) {
      console.error('Erreur lors du chargement des pointages:', error);
      message.error('Erreur lors du chargement des données');
      // En cas d'erreur, on initialise avec un tableau vide
      setPointages([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (data) => {
    const présents = data.filter(p => (p.status || p.statut) === 'Présent').length;
    const absents = data.filter(p => (p.status || p.statut) === 'Absent').length;
    
    setStats({
      présents,
      absents,
      total: data.length
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtrer les pointages
  const filteredPointages = pointages.filter((pointage) => {
    const matchSearch = pointage.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       pointage.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchClasse = !selectedClasse || pointage.classe === selectedClasse;
    const matchFiliere = !selectedFiliere || pointage.filiere === selectedFiliere;
    
    let matchDate = true;
    if (dateRange && dateRange.length === 2) {
      const pointageDate = moment(pointage.date, 'DD/MM/YYYY');
      matchDate = pointageDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }
    
    return matchSearch && matchClasse && matchFiliere && matchDate;
  });

  const exportToCSV = () => {
    const headers = ["Nom", "Email", "Classe", "Filière", "Date", "Heure", "Statut"];
    const csvData = filteredPointages.map(p => [
      p.nom,
      p.email || '',
      p.classe,
      p.filiere,
      p.date,
      p.heure,
      p.status || p.statut
    ]);
    
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      headers.join(",") +
      "\n" +
      csvData.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pointages_${moment().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Export CSV réalisé avec succès');
  };

  // Obtenir les classes et filières uniques pour les filtres
  const getUniqueValues = (key) => {
    return [...new Set(pointages.map(p => p[key]).filter(Boolean))];
  };

  // Colonnes pour le tableau Ant Design
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Classe',
      dataIndex: 'classe',
      key: 'classe',
      filters: getUniqueValues('classe').map(classe => ({ text: classe, value: classe })),
      onFilter: (value, record) => record.classe === value,
    },
    {
      title: 'Filière',
      dataIndex: 'filiere',
      key: 'filiere',
      filters: getUniqueValues('filiere').map(filiere => ({ text: filiere, value: filiere })),
      onFilter: (value, record) => record.filiere === value,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => moment(a.date, 'DD/MM/YYYY').unix() - moment(b.date, 'DD/MM/YYYY').unix(),
    },
    {
      title: 'Heure',
      dataIndex: 'heure',
      key: 'heure',
      sorter: (a, b) => moment(a.heure, 'HH:mm').unix() - moment(b.heure, 'HH:mm').unix(),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const actualStatus = status || record.statut;
        let color = 'green';
        if (actualStatus === 'Absent') color = 'red';
        return <Tag color={color}>{actualStatus}</Tag>;
      },
      filters: [
        { text: 'Présent', value: 'Présent' },
        { text: 'Absent', value: 'Absent' },
      ],
      onFilter: (value, record) => (record.status || record.statut) === value,
    },
  ];

  return (
    <div className="pointage-page">
      <div className="page-header">
        <h1><FaUsers /> Gestion des Présences - Administration</h1>
        <p>Interface administrateur pour la gestion et le suivi des présences</p>
      </div>

      <div className="pointage-container">
        {/* Statistiques */}
        <Row gutter={16} className="stats-section">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Étudiants"
                value={stats.total}
                prefix={<FaUsers />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Présents"
                value={stats.présents}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="Absents"
                value={stats.absents}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Barre d'outils */}
        <div className="toolbar">
          <div className="toolbar-left">
            <Input.Search
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
            <Button 
              icon={<FaFilter />} 
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? 'primary' : 'default'}
            >
              Filtres
            </Button>
          </div>
          
          <div className="toolbar-right">
            <Button 
              icon={<FaSync />} 
              onClick={loadPointages}
              loading={loading}
              type="primary"
            >
              Actualiser
            </Button>
            <Button 
              icon={<FaDownload />} 
              onClick={exportToCSV}
              disabled={filteredPointages.length === 0}
            >
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <Card className="filters-card" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <label>Période:</label>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder={['Date début', 'Date fin']}
                />
              </Col>
              <Col span={8}>
                <label>Classe:</label>
                <Select
                  value={selectedClasse}
                  onChange={setSelectedClasse}
                  placeholder="Sélectionner une classe"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {getUniqueValues('classe').map(classe => (
                    <Option key={classe} value={classe}>{classe}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <label>Filière:</label>
                <Select
                  value={selectedFiliere}
                  onChange={setSelectedFiliere}
                  placeholder="Sélectionner une filière"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {getUniqueValues('filiere').map(filiere => (
                    <Option key={filiere} value={filiere}>{filiere}</Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        )}

        {/* Tableau des présences */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={filteredPointages}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredPointages.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} étudiants`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default Pointage;
