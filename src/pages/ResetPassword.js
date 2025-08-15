// src/pages/ResetPassword.js
// Page de réinitialisation de mot de passe avec lien reçu par email

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Form, Input, Button, Card, Alert, message } from "antd";
import { LockOutlined, ArrowLeftOutlined, LoadingOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import authService from "../services/authService";
import { colors, spacing, typography } from "../utils/styles/designTokens";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { uidb64, token } = useParams(); // Récupérer les paramètres de l'URL

  // Verrouiller le scroll de la page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.height = '100vh';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.height = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);

  // Vérifier si les paramètres sont présents
  useEffect(() => {
    if (!uidb64 || !token) {
      setError('Lien de réinitialisation invalide ou incomplet.');
    }
  }, [uidb64, token]);

  const handleFormChange = () => {
    if (error) {
      setError('');
    }
  };

  const validatePassword = (password) => {
    // Validation basique : au moins 8 caractères
    if (password.length < 8) {
      return false;
    }
    return true;
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation côté client
    if (!validatePassword(values.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword(uidb64, token, values.password);
      
      if (result.success) {
        setSuccess(true);
        message.success(result.message);
        form.resetFields();
        
        // Redirection vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error);
      }
      
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Styles similaires aux autres pages d'authentification
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
    padding: spacing.md,
    overflow: 'hidden',
    boxSizing: 'border-box',
    margin: 0,
    zIndex: 1000,
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: 'none',
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.primary.main,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  };

  const inputStyle = {
    height: '48px',
    borderRadius: '8px',
    fontSize: typography.fontSize.base,
  };

  const buttonStyle = {
    height: '48px',
    borderRadius: '8px',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
    border: 'none',
    boxShadow: '0 4px 12px rgba(0, 26, 78, 0.3)',
  };

  const linkStyle = {
    color: colors.primary.main,
    textDecoration: 'none',
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <div style={{ padding: spacing.xl }}>
          <h1 style={titleStyle}>Nouveau mot de passe</h1>
          
          <p style={{ 
            textAlign: 'center', 
            marginBottom: spacing.lg,
            color: colors.text.secondary,
            fontSize: typography.fontSize.base 
          }}>
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: spacing.md }}
            />
          )}

          {success && (
            <Alert
              message="Mot de passe réinitialisé !"
              description="Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion..."
              type="success"
              showIcon
              style={{ marginBottom: spacing.md }}
            />
          )}

          <Form
            form={form}
            name="resetPassword"
            onFinish={onFinish}
            onValuesChange={handleFormChange}
            layout="vertical"
            size="large"
            preserve={true}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Form.Item
              name="password"
              label="Nouveau mot de passe"
              rules={[
                {
                  required: true,
                  message: 'Veuillez entrer votre nouveau mot de passe'
                },
                {
                  min: 8,
                  message: 'Le mot de passe doit contenir au moins 8 caractères'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.primary.main }} />}
                placeholder="Votre nouveau mot de passe"
                autoComplete="new-password"
                style={inputStyle}
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmer le mot de passe"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Veuillez confirmer votre mot de passe'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.primary.main }} />}
                placeholder="Confirmez votre mot de passe"
                autoComplete="new-password"
                style={inputStyle}
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: spacing.sm }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={success || (!uidb64 || !token)}
                style={buttonStyle}
                block
                icon={loading ? <LoadingOutlined /> : <LockOutlined />}
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/login" 
                style={linkStyle}
              >
                <ArrowLeftOutlined style={{ marginRight: spacing.xs }} />
                Retour à la connexion
              </Link>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
