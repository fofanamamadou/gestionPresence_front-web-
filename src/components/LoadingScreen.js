import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './LoadingScreen.css';

const LoadingScreen = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img src="/LOGO FLI-On-blue.png" alt="FLI Logo" className="loading-logo" />
        <Spin indicator={antIcon} />
      </div>
    </div>
  );
};

export default LoadingScreen; 