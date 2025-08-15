// src/components/dashboard/KPICard.js
import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { colors } from '../../utils/styles/designTokens';

/**
 * Composant de carte KPI pour afficher des indicateurs clés
 */
const KPICard = ({ title, value, prefix, suffix, tooltip, trend, loading = false }) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const isPositive = trend >= 0;
    const trendValue = Math.abs(trend);
    const TrendIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;
    
    return (
      <span style={{ color: isPositive ? colors.success : colors.error, marginLeft: 8 }}>
        <TrendIcon /> {trendValue}%
      </span>
    );
  };

  return (
    <Tooltip title={tooltip}>
      <Card 
        loading={loading}
        bordered={false}
        style={{ 
          height: '100%',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Statistic
          title={title}
          value={value}
          precision={typeof value === 'number' && value % 1 !== 0 ? 2 : 0}
          valueStyle={{ 
            color: colors.primary,
            fontWeight: 600,
            fontSize: '1.75rem'
          }}
          prefix={prefix}
          suffix={
            <>
              {suffix}
              {getTrendIcon()}
            </>
          }
        />
      </Card>
    </Tooltip>
  );
};

export default KPICard;
