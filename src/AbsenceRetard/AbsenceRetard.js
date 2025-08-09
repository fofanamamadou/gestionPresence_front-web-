import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./AbsenceRetard.css";

const AbsenceRetard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [absencesRetards] = useState([
    { id: 1, nom: "Diallo Aissata", matricule: "U12345", date: "2024-10-01", type: "Absence" },
    { id: 2, nom: "Sow Mamadou", matricule: "U67890", date: "2024-10-02", type: "Retard" },
    { id: 3, nom: "Bah Fatoumata", matricule: "U54321", date: "2024-10-03", type: "Absence" },
    { id: 4, nom: "Kane Ibrahima", matricule: "U11111", date: "2024-10-04", type: "Retard" },
    { id: 5, nom: "Touré Aminata", matricule: "U22222", date: "2024-10-05", type: "Absence" },
    { id: 6, nom: "Camara Aliou", matricule: "U33333", date: "2024-10-06", type: "Retard" },
    { id: 7, nom: "Diop Mariam", matricule: "U44444", date: "2024-10-07", type: "Absence" },
    { id: 8, nom: "Fofana Boubacar", matricule: "U55555", date: "2024-10-08", type: "Retard" },
  ]);

  const itemsPerPage = 3;
  const [currentPageAbs, setCurrentPageAbs] = useState(1);
  const [currentPageRet, setCurrentPageRet] = useState(1);

  const filteredAbsences = absencesRetards.filter(ar => ar.type === "Absence")
    .filter(ar => ar.nom.toLowerCase().includes(searchQuery.toLowerCase()) || ar.matricule.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredRetards = absencesRetards.filter(ar => ar.type === "Retard")
    .filter(ar => ar.nom.toLowerCase().includes(searchQuery.toLowerCase()) || ar.matricule.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPagesAbs = Math.ceil(filteredAbsences.length / itemsPerPage);
  const totalPagesRet = Math.ceil(filteredRetards.length / itemsPerPage);

  const currentAbsences = filteredAbsences.slice((currentPageAbs - 1) * itemsPerPage, currentPageAbs * itemsPerPage);
  const currentRetards = filteredRetards.slice((currentPageRet - 1) * itemsPerPage, currentPageRet * itemsPerPage);

  const nextPageAbs = () => { if (currentPageAbs < totalPagesAbs) setCurrentPageAbs(currentPageAbs + 1); };
  const prevPageAbs = () => { if (currentPageAbs > 1) setCurrentPageAbs(currentPageAbs - 1); };

  const nextPageRet = () => { if (currentPageRet < totalPagesRet) setCurrentPageRet(currentPageRet + 1); };
  const prevPageRet = () => { if (currentPageRet > 1) setCurrentPageRet(currentPageRet - 1); };

  const exportToCSV = () => {
    const headers = ["Nom", "Matricule", "Date", "Type"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
      absencesRetards.map(ar => Object.values(ar).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "absences_retards.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="absence-retard-page">
      <h1>Gestion des Absences et Retards 📅</h1>
      
      <div className="search-bar">
        <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <span className="search-icon">🔍</span>
      </div>

      <div className="tables-container">
        <div className="table-section">
          <h2>📌 Absences</h2>
          <div className="absence-retard-table">
            {currentAbsences.map(absence => (
              <div key={absence.id} className="table-row">
                <div className="row-cell">{absence.nom}</div>
                <div className="row-cell">{absence.matricule}</div>
                <div className="row-cell">{absence.date}</div>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={prevPageAbs} disabled={currentPageAbs === 1}>◀</button>
            <span>Page {currentPageAbs} sur {totalPagesAbs}</span>
            <button onClick={nextPageAbs} disabled={currentPageAbs === totalPagesAbs}>▶</button>
          </div>
        </div>

        <div className="table-section">
          <h2>⏳ Retards</h2>
          <div className="absence-retard-table">
            {currentRetards.map(retard => (
              <div key={retard.id} className="table-row">
                <div className="row-cell">{retard.nom}</div>
                <div className="row-cell">{retard.matricule}</div>
                <div className="row-cell">{retard.date}</div>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={prevPageRet} disabled={currentPageRet === 1}>◀</button>
            <span>Page {currentPageRet} sur {totalPagesRet}</span>
            <button onClick={nextPageRet} disabled={currentPageRet === totalPagesRet}>▶</button>
          </div>
        </div>
      </div>

      <button onClick={exportToCSV} className="export-button">Exporter en CSV</button>

      <div className="chart-container">
        <h2>📊 Statistiques</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: "Absences", value: filteredAbsences.length },
            { name: "Retards", value: filteredRetards.length }
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#007bff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AbsenceRetard;
