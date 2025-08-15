// designTokens.js

// Couleurs
export const colors = {
  primary: {
    dark: '#081f3e',
    main: '#0a2a55',
    light: '#123b6d',
    highlight: '#00b7ff',
  },
  secondary: {
    background: '#f5f7fa',
    white: '#ffffff',
    border: '#e8e8e8',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  status: {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc658',
    info: '#0088FE',
  },
  chart: {
    blue: '#8884d8',
    green: '#82ca9d',
    yellow: '#FFBB28',
    orange: '#FF8042',
    cyan: '#0088FE',
    teal: '#00C49F',
    red: '#FF4500',
    purple: '#A020F0',
  },
  roles: {
    student: '#0088FE',
    teacher: '#28a745',
    staff: '#6f42c1',
    admin: '#dc3545',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
    white: '#ffffff',
    link: '#00b7ff',
  },
};

// Typographie
export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Espacement
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '50%',
};

// Ombres
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Fonctions utilitaires (couleurs status, roles)
export const getStatusColor = (status) => {
  const statusMap = {
    'present': colors.status.success,
    'absent': colors.status.error,
    'active': colors.status.success,
    'inactive': colors.status.error,
    'pending': colors.status.warning,
    'approved': colors.status.success,
    'rejected': colors.status.error,
  };
  return statusMap[status?.toLowerCase()] || colors.text.secondary;
};

export const getRoleColor = (role) => {
  const roleMap = {
    'etudiant': colors.roles.student,
    'student': colors.roles.student,
    'professeur': colors.roles.teacher,
    'teacher': colors.roles.teacher,
    'personnel': colors.roles.staff,
    'staff': colors.roles.staff,
    'admin': colors.roles.admin,
    'administrator': colors.roles.admin,
  };
  return roleMap[role?.toLowerCase()] || colors.text.secondary;
};

export const styles = {
  // Styles globaux du composant/page
  pageContainer: {
    padding: spacing.lg,
    backgroundColor: colors.secondary.background,
    minHeight: '100vh',
    fontFamily: typography.fontFamily.primary,
    color: colors.text.primary,
  },
  pageTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },

  // Styles de carte / conteneur
  card: {
    backgroundColor: colors.secondary.white,
    borderRadius: borderRadius.md,
    boxShadow: shadows.base,
    border: `1px solid ${colors.secondary.border}`,
  },

  // Boutons
  buttonPrimary: {
    backgroundColor: colors.primary.main,
    color: colors.text.white,
    borderRadius: borderRadius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    border: 'none',
    cursor: 'pointer',
    fontWeight: typography.fontWeight.medium,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary.white,
    color: colors.text.primary,
    borderRadius: borderRadius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    border: `1px solid ${colors.secondary.border}`,
    cursor: 'pointer',
    fontWeight: typography.fontWeight.medium,
  },

  // Input
  input: {
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.secondary.border}`,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
  },

  // Table
  tableHeader: {
    backgroundColor: colors.secondary.background,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  tableRow: {
    borderBottom: `1px solid ${colors.secondary.border}`,
  },
};
