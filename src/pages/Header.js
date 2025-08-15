import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Avatar,
  Badge,
  Space,
  Button,
  Dropdown,
  Modal,
  Form,
  Input,
  Tabs,
  message,
  Typography,
  theme,
  Descriptions,
} from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MailOutlined,
  LockOutlined,
  LoadingOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import { colors, spacing } from '../utils/styles/designTokens';

const { Text } = Typography;
const { TabPane } = Tabs;

// Header simplifié — plus d'édition du profil en local, on lit les données via authService
const Header = ({ collapsed, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // styles locaux utilisés dans le composant
  const rightContentStyle = { display: 'flex', alignItems: 'center', gap: 16 };
  const actionStyle = { padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Remplace axios par authService.getUserData() / getProfile()
  const fetchUserData = async () => {
    const local = authService.getUserData();
    if (local) {
      setUserData(local);
      return;
    }

    // si pas en local, tenter de récupérer depuis l'API via authService.getProfile()
    try {
      const res = await authService.getProfile();
      if (res.success) {
        setUserData(res.data);
      } else {
        console.error('Impossible de récupérer le profil:', res.error);
      }
    } catch (err) {
      console.error('Erreur lors de fetchUserData:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(navigate);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Utilise la signature authService.changePassword(currentPassword, newPassword)
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error('Tous les champs sont requis.');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (oldPassword === newPassword) {
      message.error("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }
    

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      message.error('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authService.changePassword(oldPassword, newPassword);
      if (res.success) {
        message.success(res.message || 'Mot de passe mis à jour avec succès');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        message.error(res.error || res.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      console.error('Erreur handlePasswordChange:', err);
      message.error('Erreur inattendue');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // menu Dropdown (AntD v5) : on gère la sélection dans onMenuClick
  const menuItems = [
    { key: 'profile', label: 'Mon Profil', icon: <UserOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Déconnexion', icon: <LogoutOutlined />, danger: true },
  ];

  const onMenuClick = ({ key }) => {
    if (key === 'profile') setIsProfileModalVisible(true);
    if (key === 'logout') handleLogout();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: collapsed ? 80 : 250,
          width: `calc(100% - ${collapsed ? 80 : 250}px)`,
          height: '60px',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 25px',
          zIndex: 1000,
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
          transition: 'left 0.3s ease, width 0.3s ease',
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{ fontSize: 16, width: 64, height: 64 }}
        />

        <div style={rightContentStyle}>
          <Space size="middle">
            <Dropdown menu={{ items: menuItems, onClick: onMenuClick }} trigger={['click']} placement="bottomRight">
              <div style={{ ...actionStyle, padding: '0 16px' }}>
                <Avatar size="default" icon={<UserOutlined />} src={userData?.avatar} style={{ backgroundColor: colors.primary.main, marginRight: spacing.sm }} />
                <Text strong style={{ color: colors.text.primary, maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
                  {userData ? `${userData.first_name || ''} ${userData.last_name || ''}` : 'Utilisateur'}
                </Text>
              </div>
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* Modal profil (lecture seule) */}
      <Modal
        title={(
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${colors.secondary.border}`, paddingBottom: spacing.sm, marginBottom: spacing.md }}>
            <UserOutlined style={{ color: colors.primary.main, marginRight: spacing.sm }} />
            <span>Profil Utilisateur</span>
          </div>
        )}
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={null}
        width={600}
        bodyStyle={{ padding: '24px 24px 0' }}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informations personnelles" key="1">
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Prénom">{userData?.first_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nom">{userData?.last_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{userData?.email || '-'}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Sécurité" key="2">
            <div style={{ padding: 20 }}>
              <h3>Changement de mot de passe</h3>
              <Form layout="vertical" onFinish={handlePasswordChange}>
                <Form.Item label="Ancien mot de passe" required>
                  <Input.Password value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item label="Nouveau mot de passe" required help="Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre">
                  <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item label="Confirmer le mot de passe" required>
                  <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item style={{ marginTop: 24 }}>
                  <Button type="primary" htmlType="submit" icon={isChangingPassword ? <LoadingOutlined /> : <SaveOutlined />} loading={isChangingPassword} block>
                    Mettre à jour le mot de passe
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default Header;
