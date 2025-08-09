// src/PageNotFound.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import "./error.css";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <FaRobot className="notfound-icon" />
        <h1>Erreur 404</h1>
        <p>Oops... La page que vous cherchez n'existe pas 👽</p>
        <button className="notfound-button" onClick={() => navigate("/")}>
          Retour à l’accueil 🚀
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;