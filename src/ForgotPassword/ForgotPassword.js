import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import axios from "../AxiosInstance/axiosInstance"; //  On utilise axiosInstance.js

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.post("reset-password",{ email : email}).then(
      (success) => {
        console.log(success);
        setMessage("Un nouveau mot de passe a été envoyé à votre adresse e-mail.");
        // Redirection a la page connexion
        setTimeout(() => {
          navigate("/login");
          window.location.reload();
        }, 5000);
        
        

      },

      (error) => {
        console.log(error)
        setMessage("Veuillez verifier l'email et reessayez.");
      }
    )
    // Simuler l'envoi d'un e-mail de réinitialisation
    
    
  };

  return (
    <div className="forgot-password-container">
      <h2>Mot de passe oublié</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span>📧</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Envoyer</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ForgotPassword;