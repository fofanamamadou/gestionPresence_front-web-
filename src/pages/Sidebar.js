import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { 
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  TableOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { colors, typography, spacing, borderRadius } from '../utils/styles/designTokens';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Styles
  const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary.dark,
    transition: 'all 0.2s',
    zIndex: 10,
  };

  const logoContainerStyle = {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary.main,
    overflow: 'hidden',
    transition: 'all 0.2s',
  };

  const logoStyle = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transition: 'all 0.2s',
  };

  const menuStyle = {
    borderRight: 0,
    backgroundColor: 'transparent',
    padding: `${spacing.sm} 0`,
  };

  const menuItemStyle = {
    margin: 0,
    borderRadius: 0,
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.ant-menu-item-selected': {
      backgroundColor: colors.primary.highlight + ' !important',
      color: colors.text.white + ' !important',
      '&:after': {
        display: 'none',
      },
    },
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/">Tableau de bord</Link>,
    },
    {
      key: '/filiere',
      icon: <BookOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/filiere">Filières</Link>,
    },
    {
      key: '/classe',
      icon: <TeamOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/classe">Classes</Link>,
    },
    {
      key: '/utilisateurs',
      icon: <UserOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/utilisateurs">Utilisateurs</Link>,
    },
    {
      key: '/pointages',
      icon: <CheckSquareOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/pointages">Pointages</Link>,
    },
    {
      key: '/modules',
      icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/modules">Modules</Link>,
    },
    {
      key: '/horaires',
      icon: <CalendarOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/horaires">Horaires</Link>,
    },
    {
      key: '/planning',
      icon: <TableOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/planning">Planning</Link>,
    },
    {
      key: '/administrateur',
      icon: <UserSwitchOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/administrateur">Administrateurs</Link>,
    },
  ];

  return (
    <Sider
      width={250}
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={siderStyle}
      trigger={null} // We'll handle the trigger in the Header
    >
      <div style={logoContainerStyle}>
        {collapsed ? (
          <img
            src="/logo_on_blue.png" // Use a square icon version for collapsed state
            alt="Logo CoursClick"
            style={{
              ...logoStyle,
              width: '40px',
              height: '40px',
            }}
          />
        ) : (
          <img
            src="/logo_on_blue.png"
            alt="Logo CoursClick"
            style={{
              ...logoStyle,
              height: '40px',
            }}
          />
        )}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={menuStyle}
        items={menuItems}
        itemStyle={menuItemStyle}
      />
    </Sider>
  );
};

export default Sidebar;
