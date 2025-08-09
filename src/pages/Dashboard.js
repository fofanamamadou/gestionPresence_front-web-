
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CountUp from 'react-countup'; // Pour la venue dynamique des chiffres
import "../Styles.css";
import {
  FaGraduationCap, FaChalkboardTeacher, FaUsers, FaClock,
  FaSchool, FaBook, FaUserClock, FaUserTimes
} from "react-icons/fa";
import axios from "../utils/axiosInstance";

export default function Dashboard() {
  const [etudiants, setEtudiants] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);

  const [absents, setAbsents] = useState([]);

  useEffect(() => {
    list_etudiants();
    list_pointages();
    list_classes();
    list_modules();

    list_absents();
    list_professeurs();
    list_personnels();
  }, []);
  
  // Liste des étudiants
  const list_etudiants = () => {
    axios.get("users/students").then(
      (res) => {
        console.log(res);
        setEtudiants(res.data);
      },
      (err) => {
        console.log(err);
        setEtudiants([]);
      }
    );
  };
  
  // Liste des pointages
  const list_pointages = () => {
    axios.get("presences/").then(
      (res) => {
        console.log(res);
        setPointages(res.data);
      },
      (err) => {
        console.log(err);
        setPointages([]);
      }
    );
  };
  
  // Liste des classes
  const list_classes = () => {
    axios.get("classes").then(
      (res) => {
        console.log(res);
        setClasses(res.data);
      },
      (err) => {
        console.log(err);
        setClasses([]);
      }
    );
  };
  
  // Liste des modules
  const list_modules = () => {
    axios.get("modules").then(
      (res) => {
        console.log(res);
        setModules(res.data);
      },
      (err) => {
        console.log(err);
        setModules([]);
      }
    );
  };
  

  
  // Liste des absences
  const list_absents = () => {
    axios.get("absences").then(
      (res) => {
        console.log(res);
        setAbsents(res.data);
      },
      (err) => {
        console.log(err);
        setAbsents([]);
      }
    );
  };
  
  // Liste des professeurs
  const list_professeurs = () => {
    axios.get("users/professors").then(
      (res) => {
        console.log(res);
        setProfesseurs(res.data);
      },
      (err) => {
        console.log(err);
        setProfesseurs([]);
      }
    );
  };
  
  // Liste des personnels
  const list_personnels = () => {
    axios.get("users/personnels").then(
      (res) => {
        console.log(res);
        setPersonnels(res.data);
      },
      (err) => {
        console.log(err);
        setPersonnels([]);
      }
    );
  };
  

  const data = [
    { name: "Étudiants", value: etudiants.length, fill: "#8884d8" },
    { name: "Professeurs", value: professeurs.length, fill: "#82ca9d" },
    { name: "Personnels", value: personnels.length, fill: "#FFBB28" },
    { name: "Pointages", value: pointages.length, fill: "#FF8042" },
    { name: "Classes", value: classes.length, fill: "#0088FE" },
    { name: "Modules", value: modules.length, fill: "#00C49F" },

    { name: "Absents", value: absents.length, fill: "#A020F0" }
  ];

  return (
    <div className="dashboard">
      <div className="stats-container">
        <div className="stats-row">
          <div className="stat-box stat-green">
            <FaGraduationCap className="stat-icon" />
            <div>
              <h3><CountUp end={etudiants.length} duration={1.5} /></h3>
              <p>Étudiants</p>
            </div>
          </div>
          <div className="stat-box stat-blue">
            <FaChalkboardTeacher className="stat-icon" />
            <div>
              <h3><CountUp end={professeurs.length} duration={1.5} /></h3>
              <p>Professeurs</p>
            </div>
          </div>
          <div className="stat-box stat-yellow">
            <FaUsers className="stat-icon" />
            <div>
              <h3><CountUp end={personnels.length} duration={1.5} /></h3>
              <p>Personnels</p>
            </div>
          </div>
          <div className="stat-box stat-red">
            <FaClock className="stat-icon" />
            <div>
              <h3><CountUp end={pointages.length} duration={1.5} /></h3>
              <p>Pointages</p>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-box stat-purple">
            <FaSchool className="stat-icon" />
            <div>
              <h3><CountUp end={classes.length} duration={1.5} /></h3>
              <p>Classes</p>
            </div>
          </div>
          <div className="stat-box stat-orange">
            <FaBook className="stat-icon" />
            <div>
              <h3><CountUp end={modules.length} duration={1.5} /></h3>
              <p>Modules</p>
            </div>
          </div>
          <div className="stat-box stat-dark-red">
            <FaUserTimes className="stat-icon" />
            <div>
              <h3><CountUp end={absents.length} duration={1.5} /></h3>
              <p>Absents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Statistiques en temps réel 📊</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Effectif" fill={({ payload }) => payload.fill} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
