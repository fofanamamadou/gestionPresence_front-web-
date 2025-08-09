// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Badge, Space, Modal, Form, Input, Tabs, message, Button } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MailOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined,
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import axios from "../AxiosInstance/axiosInstance";

const { TabPane } = Tabs;

export default function Header({ collapsed }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      const payloadBase64 = accessToken.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const userId = payload.user_id;
      
      try {
        const response = await axios.get(`users/${userId}`);
        setUserData(response.data);
        form.setFieldsValue(response.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("utilisateur");
    
    delete axios.defaults.headers.common['Authorization'];
    
    navigate("/login", { replace: true });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const accessToken = localStorage.getItem("access_token");
      const payloadBase64 = accessToken.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const userId = payload.user_id;

      const response = await axios.put(`users/${userId}`, values);
      setUserData(response.data);
      setIsEditing(false);
      message.success("Profil mis à jour avec succès !");
      fetchUserData();
    } catch (error) {
      message.error("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };
  
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error("Tous les champs sont requis.");
      return;
    }

    if (!validatePassword(newPassword)) {
      message.error("Le mot de passe doit contenir au moins 8 caractères, avec au moins une lettre majuscule et un chiffre.");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post("change-password", {
        old_password: oldPassword,
        new_password: newPassword,
        password_confirm: confirmPassword
      });
      
      message.success(response.data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const profileMenu = {
    items: [
      {
        key: '1',
        label: 'Mon Profil',
        icon: <UserOutlined />,
        onClick: () => setIsProfileModalVisible(true)
      },
      {
        type: 'divider'
      },
      {
        key: '3',
        label: 'Déconnexion',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
        danger: true
      }
    ]
  };

  const notificationItems = [
    {
      key: '1',
      label: '📌 Nouvelle absence enregistrée'
    },
    {
      key: '2',
      label: '📅 Prochain contrôle prévu'
    },
    {
      key: '3',
      label: '🕒 Mise à jour de l\'emploi du temps'
    },
    {
      type: 'divider'
    },
    {
      key: '4',
      label: '📩 Voir toutes les notifications'
    }
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: collapsed ? 80 : 250,
          width: `calc(100% - ${collapsed ? 80 : 250}px)`,
          height: "60px",
          background: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 25px",
          zIndex: 1000,
          boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.1)",
          transition: "left 0.3s ease, width 0.3s ease"
        }}
      >
        <Dropdown
          menu={{ items: notificationItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={5} size="small">
            <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
          </Badge>
        </Dropdown>

        <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              src={userData?.photo_url}
              icon={!userData?.photo_url && <UserOutlined />}
              style={{ 
                backgroundColor: !userData?.photo_url ? '#001a4e' : 'transparent',
                verticalAlign: 'middle' 
              }}
            />
            <span style={{ 
              color: '#001a4e',
              fontWeight: '500',
              marginLeft: '8px'
            }}>
              {userData ? `${userData.first_name} ${userData.last_name}` : 'Chargement...'}
            </span>
          </Space>
        </Dropdown>
      </div>

      <Modal
        title="Mon Profil"
        open={isProfileModalVisible}
        onCancel={() => {
          setIsProfileModalVisible(false);
          setIsEditing(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informations" key="1">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar
                size={100}
                src={userData?.photo_url}
                icon={!userData?.photo_url && <UserOutlined />}
                style={{
                  backgroundColor: !userData?.photo_url ? '#001a4e' : 'transparent'
                }}
              />
              <h2 style={{ marginTop: '10px', marginBottom: '5px' }}>
                {userData?.first_name} {userData?.last_name}
              </h2>
              <span style={{ color: '#666' }}>
                {userData?.is_staff
                  ? "Administrateur"
                  : userData?.roles_details?.map(role => role.name).join(", ")}
              </span>
            </div>

            <Form
              form={form}
              layout="vertical"
              disabled={!isEditing}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name="first_name"
                  label="Prénom"
                  rules={[{ required: true, message: 'Le prénom est requis' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                  name="last_name"
                  label="Nom"
                  rules={[{ required: true, message: 'Le nom est requis' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'L\'email est requis' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              {/* <div style={{ textAlign: 'right', marginTop: '20px' }}>
                {!isEditing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier
                  </Button>
                ) : (
                  <Space>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setIsEditing(false);
                        form.resetFields();
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="primary"
                      icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
                      onClick={handleSaveProfile}
                      loading={saving}
                    >
                      Enregistrer
                    </Button>
                  </Space>
                )}
              </div> */}
            </Form>
          </TabPane>
          
          <TabPane tab="Sécurité" key="2">
            <div style={{ padding: '20px' }}>
              <h3>Changement de mot de passe</h3>
              <Form layout="vertical">
                <Form.Item
                  label="Ancien mot de passe"
                  required
                >
                  <Input.Password
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="Nouveau mot de passe"
                  required
                  help="Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre"
                >
                  <Input.Password
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="Confirmer le mot de passe"
                  required
                >
                  <Input.Password
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                  <Button
                    type="primary"
                    icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
                    onClick={handlePasswordChange}
                    loading={saving}
                  >
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
}
