/**
 * Layout Style Helpers
 *
 * Common layout patterns and utilities
 */

import { CSSProperties } from 'react';
import { Theme } from '../../types/theme.types';

/**
 * Top Navigation Bar layout
 */
export const topNavBarStyles = {
  container: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    padding: `0 ${theme.spacing.lg}`,
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    boxShadow: theme.shadows.sm,
  }),

  left: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  }),

  right: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  }),
};

/**
 * Request Line layout
 */
export const requestLineStyles = {
  container: (theme: Theme): CSSProperties => ({
    display: 'flex',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  }),

  methodSelector: (): CSSProperties => ({
    width: '110px',
    flexShrink: 0,
  }),

  urlInput: (): CSSProperties => ({
    flex: 1,
    minWidth: 0,
  }),

  sendButton: (): CSSProperties => ({
    width: '120px',
    flexShrink: 0,
  }),
};

/**
 * Tab container layout
 */
export const tabContainerStyles = {
  container: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    backgroundColor: theme.colors.background.primary,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  }),

  tabs: (): CSSProperties => ({
    display: 'flex',
    flex: 1,
    gap: '4px',
  }),

  rightSection: (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  }),
};

/**
 * Response Status Bar layout
 */
export const responseStatusBarStyles = {
  container: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '44px',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
  }),

  tabs: (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    gap: '4px',
  }),

  statusInfo: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  }),
};

/**
 * Panel layout
 */
export const panelStyles = {
  container: (theme: Theme): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.background.primary,
    overflow: 'hidden',
  }),

  content: (theme: Theme): CSSProperties => ({
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing.lg,
  }),

  header: (theme: Theme): CSSProperties => ({
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    backgroundColor: theme.colors.background.secondary,
  }),
};

/**
 * Breadcrumb layout
 */
export const breadcrumbStyles = {
  container: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    padding: `0 ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.secondary,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
  }),

  item: (theme: Theme): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  }),

  separator: (theme: Theme): CSSProperties => ({
    margin: `0 ${theme.spacing.xs}`,
    color: theme.colors.text.tertiary,
  }),
};

/**
 * Main layout structure
 */
export const mainLayoutStyles = {
  app: (): CSSProperties => ({
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  }),

  mainContent: (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  }),

  splitView: (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'row', // Horizontal split: Request LEFT | Response RIGHT
    flex: 1,
    overflow: 'hidden',
  }),

  requestPanel: (theme: Theme): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '400px',
    overflow: 'hidden',
    borderRight: `1px solid ${theme.colors.border.primary}`,
  }),

  responsePanel: (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '400px',
    overflow: 'hidden',
  }),

  divider: (theme: Theme): CSSProperties => ({
    width: '4px',
    backgroundColor: theme.colors.border.primary,
    cursor: 'col-resize',
    flexShrink: 0,
  }),
};

/**
 * Table layout
 */
export const tableStyles = {
  container: (theme: Theme): CSSProperties => ({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.typography.fontSizes.base,
  }),

  header: (theme: Theme): CSSProperties => ({
    backgroundColor: theme.colors.background.secondary,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    textAlign: 'left',
    padding: theme.spacing.sm,
    fontWeight: theme.typography.fontWeights.medium,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  }),

  cell: (theme: Theme): CSSProperties => ({
    padding: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    color: theme.colors.text.primary,
  }),

  row: (): CSSProperties => ({
    transition: 'background-color 0.1s ease',
  }),
};
