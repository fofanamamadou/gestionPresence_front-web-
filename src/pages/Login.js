import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, message, Button, Card, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, SafetyCertificateOutlined, LoginOutlined } from '@ant-design/icons';

// Import du service d'authentification, du contexte et du système de design
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, spacing } from '../utils/styles/designTokens';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // Empêcher le scroll et s'assurer que le fond couvre toute la page
  React.useEffect(() => {
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

  const onFinish = async (values) => {
    setError('');

    try {
      const result = await login(values.email.trim(), values.password, true); // true = admin login
      
      if (result.success) {
        message.success(result.message || 'Connexion administrateur réussie');
        navigate('/');
      } else {
        setError(result.error);
        // Préserver explicitement les valeurs du formulaire en cas d'erreur
        form.setFieldsValue({
          email: values.email,
          password: values.password
        });
      }
      
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      // Préserver explicitement les valeurs du formulaire en cas d'erreur
      form.setFieldsValue({
        email: values.email,
        password: values.password
      });
    }
  };

  const handleFormChange = () => {
    // Effacer l'erreur quand l'utilisateur modifie le formulaire
    if (error) {
      setError('');
    }
  };

  const loginContainerStyle = {
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

  const loginCardStyle = {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: 'none',
  };

  const logoContainerStyle = {
    textAlign: 'center',
    marginBottom: spacing.xl,
  };

  const logoStyle = {
    width: '220px',
    height: 'auto'
  };

  const titleStyle = {
    color: colors.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  };

  const subtitleStyle = {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.lg,
  };

  const formStyle = {
    padding: `0 ${spacing.md}`,
  };

  const inputStyle = {
    borderRadius: '8px',
    height: '48px',
  };

  const buttonStyle = {
    height: '48px',
    borderRadius: '8px',
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
    border: 'none',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  };

  const linkStyle = {
    color: colors.primary.main,
    textAlign: 'center',
    display: 'block',
    marginTop: spacing.md,
    textDecoration: 'none',
  };

  return (
    <div style={loginContainerStyle}>
      <Card style={loginCardStyle}>
        <div style={logoContainerStyle}>
          <img 
            src="/logo_on_white.png" 
            alt="Logo CoursClick" 
            style={logoStyle}
          />
          <Title level={2} style={titleStyle}>
            <SafetyCertificateOutlined style={{ marginRight: spacing.sm, color: colors.primary.main }} />
            Administration
          </Title>
          <Text style={subtitleStyle}>
            Connectez-vous à votre espace d'administration
          </Text>
        </div>

        {error && (
          <Alert
            message="Erreur de connexion"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: spacing.md }}
          />
        )}

        <Form
          form={form}
          name="adminLogin"
          onFinish={onFinish}
          onValuesChange={handleFormChange}
          layout="vertical"
          style={formStyle}
          size="large"
          preserve={true}
          validateTrigger={['onBlur']}
          onSubmit={(e) => {
            // Empêche uniquement la soumission HTML native
            e.preventDefault();
          }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: colors.primary.main }} />}
              placeholder="admin@exemple.com"
              autoComplete="email"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: colors.primary.main }} />}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: spacing.sm }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={buttonStyle}
              block
              icon={<LoginOutlined />}
            >
              Se connecter
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link 
              to="/forgot-password" 
              style={linkStyle}
              onClick={() => {
                console.log('Navigation vers forgot-password');
              }}
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </Form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: spacing.lg, 
          padding: spacing.md,
          borderTop: `1px solid ${colors.secondary.border}`,
        }}>
          <Text style={{ 
            fontSize: typography.fontSize.sm, 
            color: colors.text.muted 
          }}>
            Interface réservée aux administrateurs
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;