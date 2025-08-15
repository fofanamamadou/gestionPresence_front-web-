// src/components/dashboard/DashboardChart.js
import React from 'react';
import { Card, Select, Spin, Empty } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { colors } from '../../utils/styles/designTokens';

const { Option } = Select;

/**
 * Palette de couleurs pour les graphiques
 */
const CHART_COLORS = [
  colors.primary,
  colors.secondary,
  colors.success,
  colors.warning,
  colors.error,
  colors.info,
  colors.dark,
];

/**
 * Composant de graphique à barres
 */
const BarChartComponent = ({ data, xKey, yKey, title, loading }) => {
  if (loading || !data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        {loading ? <Spin /> : <Empty description="Aucune donnée disponible" />}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey={xKey} 
          angle={-45} 
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip 
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        />
        <Legend />
        <Bar 
          dataKey={yKey} 
          name={title}
          fill={colors.primary}
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Composant de graphique circulaire
 */
const PieChartComponent = ({ data, nameKey, valueKey, title, loading }) => {
  if (loading || !data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        {loading ? <Spin /> : <Empty description="Aucune donnée disponible" />}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [value, title]}
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Composant principal de graphique du tableau de bord
 */
const DashboardChart = ({ 
  type = 'bar', 
  data = [], 
  title, 
  loading = false,
  xKey = 'name',
  yKey = 'value',
  className = ''
}) => {
  const [chartType, setChartType] = React.useState(type);

  const chartProps = {
    data: data.map((item, index) => ({
      ...item,
      [xKey]: item[xKey] || `Item ${index + 1}`,
      [yKey]: item[yKey] || 0
    })),
    xKey,
    yKey,
    title,
    loading
  };

  return (
    <Card 
      title={title}
      className={className}
      style={{ 
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
      extra={
        <Select
          defaultValue={chartType}
          onChange={setChartType}
          size="small"
          style={{ width: 120 }}
        >
          <Option value="bar">Barres</Option>
          <Option value="pie">Circulaire</Option>
        </Select>
      }
    >
      <div style={{ flex: 1, minHeight: 300 }}>
        {chartType === 'bar' ? (
          <BarChartComponent {...chartProps} />
        ) : (
          <PieChartComponent {...chartProps} />
        )}
      </div>
    </Card>
  );
};

export default DashboardChart;
