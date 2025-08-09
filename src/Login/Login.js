import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { Form, Input, message, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from '../AxiosInstance/axiosInstance';

const Login = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    setIsLoading(true);

    axios.post('token/', { 
      email: values.email.trim(), 
      password: values.password 
    }).then(
      (success) => {
        console.log(success);
        const { access, refresh, user } = success.data;
        
        // Stockage des tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Configuration du header par défaut pour les futures requêtes
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        message.success("Connexion réussie !");
        setIsLoading(false);
        navigate("/");
        window.location.reload();
      },

      (error) => {
        console.log("error:", error);
        setIsLoading(false);
        message.error("Email ou mot de passe incorrect");
        
      }
    );
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/LOGO FLI-On-blue.png" alt="FLI Logo" className="logo" />
      </div>
      <div className="login-right">
        <h1>Connexion</h1>
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Veuillez saisir un email valide' }
            ]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
              size="large"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Mot de passe"
              size="large"
              disabled={isLoading}
            />
          </Form.Item>

          <Link to="/forgot-password" className="forgot-password">
            Mot de passe oublié ?
          </Link>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={isLoading}
              block
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;