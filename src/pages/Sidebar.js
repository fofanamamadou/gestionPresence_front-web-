import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  TableOutlined,
  UserSwitchOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";



const { Sider } = Layout;

export default function Sidebar() {
  return (
    <Sider width={250} className="sidebar">
      <div className="logo-container">
        <img
          src="/LOGO FLI-On-blue.png"
          alt="FLI Logo"
          className="logo"
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["/"]}
        className="menu-style"
      >
        <Menu.Item key="/" icon={<DashboardOutlined />}>
          <Link to="/" >Tableau de bord</Link>
        </Menu.Item>
        {/* <Menu.Item key="/absence-retard" icon={<ClockCircleOutlined />}>
          <Link to="/absence-retard">Absence / Retard</Link>
        </Menu.Item> */}
        <Menu.Item key="/filiere" icon={<BookOutlined />}>
          <Link to="/filiere">Filières</Link>
        </Menu.Item>
        <Menu.Item key="/classe" icon={<TeamOutlined />}>
          <Link to="/classe">Classes</Link>
        </Menu.Item>
        <Menu.Item key="/utilisateurs" icon={<UserOutlined />}>
          <Link to="/utilisateurs">Utilisateurs</Link>
        </Menu.Item>
        <Menu.Item key="/pointages" icon={<CheckSquareOutlined />}>
          <Link to="/pointages">Pointages</Link>
        </Menu.Item>
        <Menu.Item key="/modules" icon={<AppstoreOutlined />}>
          <Link to="/modules">Modules</Link>
        </Menu.Item>
        <Menu.Item key="/horaires" icon={<CalendarOutlined />}>
          <Link to="/horaires">Horaires</Link>
        </Menu.Item>
        <Menu.Item key="/planning" icon={<TableOutlined />}>
          <Link to="/planning">Planning</Link>
        </Menu.Item>
        <Menu.Item key="/administrateur" icon={<UserSwitchOutlined />}>
          <Link to="/administrateur">Administrateurs</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
