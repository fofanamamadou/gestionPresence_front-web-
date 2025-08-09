// UI Utilities - Common styles and components for consistent UI
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from './designTokens';

// Ant Design theme configuration
export const antdTheme = {
  token: {
    colorPrimary: colors.primary.main,
    colorSuccess: colors.status.success,
    colorWarning: colors.status.warning,
    colorError: colors.status.error,
    colorInfo: colors.status.info,
    fontFamily: typography.fontFamily.primary,
    fontSize: parseInt(typography.fontSize.base),
    borderRadius: parseInt(borderRadius.md),
  },
  components: {
    Button: {
      borderRadius: parseInt(borderRadius.sm),
      fontWeight: typography.fontWeight.medium,
    },
    Card: {
      borderRadius: parseInt(borderRadius.md),
      boxShadow: shadows.base,
    },
    Table: {
      headerBg: colors.secondary.background,
      headerColor: colors.text.primary,
      borderColor: colors.secondary.border,
    },
    Input: {
      borderRadius: parseInt(borderRadius.sm),
    },
    Modal: {
      borderRadius: parseInt(borderRadius.lg),
    },
  },
};

// Common CSS classes as objects (for styled-components or inline styles)
export const styles = {
  // Layout
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${spacing.md}`,
  },
  
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  // Cards and containers
  pageContainer: {
    padding: spacing.lg,
    backgroundColor: colors.secondary.background,
    minHeight: '100vh',
  },
  
  contentCard: {
    ...commonStyles.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  statsCard: {
    ...commonStyles.card,
    padding: spacing.md,
    textAlign: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadows.md,
    },
  },
  
  // Headers and titles
  pageTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    borderBottom: `2px solid ${colors.primary.main}`,
    paddingBottom: spacing.sm,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  
  // Buttons
  primaryButton: {
    ...commonStyles.button.primary,
    '&:hover': {
      backgroundColor: colors.primary.light,
      transform: 'translateY(-1px)',
      boxShadow: shadows.md,
    },
  },
  
  secondaryButton: {
    ...commonStyles.button.secondary,
    '&:hover': {
      backgroundColor: colors.secondary.background,
      borderColor: colors.primary.main,
      color: colors.primary.main,
    },
  },
  
  dangerButton: {
    backgroundColor: colors.status.error,
    color: colors.text.white,
    borderRadius: borderRadius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    border: 'none',
    cursor: 'pointer',
    fontWeight: typography.fontWeight.medium,
    '&:hover': {
      backgroundColor: '#c82333',
      transform: 'translateY(-1px)',
    },
  },
  
  // Status indicators
  statusBadge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    display: 'inline-block',
  },
  
  // Forms
  formGroup: {
    marginBottom: spacing.md,
  },
  
  formLabel: {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  
  formInput: {
    ...commonStyles.input,
    width: '100%',
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 2px ${colors.primary.main}20`,
    },
  },
  
  // Tables
  tableHeader: {
    ...commonStyles.table.header,
    padding: spacing.md,
  },
  
  tableCell: {
    padding: spacing.md,
    borderBottom: `1px solid ${colors.secondary.border}`,
  },
  
  // Loading and empty states
  loadingContainer: {
    ...styles.flexCenter,
    padding: spacing['2xl'],
    color: colors.text.secondary,
  },
  
  emptyState: {
    textAlign: 'center',
    padding: spacing['2xl'],
    color: colors.text.muted,
  },
  
  // Sidebar specific
  sidebarContainer: {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
    color: colors.text.white,
    height: '100vh',
    transition: 'width 0.3s ease',
  },
  
  sidebarItem: {
    padding: spacing.md,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
    },
  },
  
  // Header specific
  headerContainer: {
    backgroundColor: colors.secondary.white,
    borderBottom: `1px solid ${colors.secondary.border}`,
    boxShadow: shadows.sm,
    padding: `${spacing.sm} ${spacing.md}`,
  },
};

// Utility functions for dynamic styling
export const getStatusStyle = (status) => {
  const baseStyle = styles.statusBadge;
  const statusColor = colors.status[status] || colors.text.secondary;
  
  return {
    ...baseStyle,
    backgroundColor: `${statusColor}20`,
    color: statusColor,
    border: `1px solid ${statusColor}40`,
  };
};

export const getRoleStyle = (role) => {
  const baseStyle = styles.statusBadge;
  const roleColors = {
    'etudiant': colors.roles.student,
    'professeur': colors.roles.teacher,
    'personnel': colors.roles.staff,
    'admin': colors.roles.admin,
  };
  
  const roleColor = roleColors[role?.toLowerCase()] || colors.text.secondary;
  
  return {
    ...baseStyle,
    backgroundColor: `${roleColor}20`,
    color: roleColor,
    border: `1px solid ${roleColor}40`,
  };
};

// Responsive utilities
export const mediaQueries = {
  mobile: `@media (max-width: 768px)`,
  tablet: `@media (max-width: 1024px)`,
  desktop: `@media (min-width: 1025px)`,
};

// Animation utilities
export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
  },
  
  slideIn: {
    animation: 'slideIn 0.3s ease-in-out',
  },
  
  bounce: {
    animation: 'bounce 0.5s ease-in-out',
  },
};

// CSS keyframes (to be added to global CSS)
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
    40%, 43% { transform: translateY(-10px); }
    70% { transform: translateY(-5px); }
  }
`;

export default {
  antdTheme,
  styles,
  getStatusStyle,
  getRoleStyle,
  mediaQueries,
  animations,
  keyframes,
};
