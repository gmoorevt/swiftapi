/**
 * Common Style Objects
 *
 * Reusable style objects for common UI patterns
 */

import { CSSProperties } from 'react';
import { Theme } from '../../types/theme.types';

/**
 * Common button styles
 */
export const buttonStyles = {
  base: (theme: Theme): CSSProperties => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: theme.transitions.normal,
    outline: 'none',
  }),

  primary: (theme: Theme): CSSProperties => ({
    ...buttonStyles.base(theme),
    backgroundColor: theme.colors.interactive.primary,
    color: '#ffffff',
  }),

  secondary: (theme: Theme): CSSProperties => ({
    ...buttonStyles.base(theme),
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.border.primary}`,
    color: theme.colors.text.primary,
  }),

  large: (theme: Theme): CSSProperties => ({
    ...buttonStyles.base(theme),
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
  }),
};

/**
 * Common input styles
 */
export const inputStyles = {
  base: (theme: Theme): CSSProperties => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSizes.base,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    outline: 'none',
    transition: theme.transitions.normal,
  }),

  focus: (theme: Theme): CSSProperties => ({
    borderColor: theme.colors.border.focus,
    boxShadow: `0 0 0 2px ${theme.colors.border.focus}33`,
  }),
};

/**
 * Common card styles
 */
export const cardStyles = {
  base: (theme: Theme): CSSProperties => ({
    backgroundColor: theme.colors.background.primary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
  }),

  elevated: (theme: Theme): CSSProperties => ({
    ...cardStyles.base(theme),
    boxShadow: theme.shadows.md,
  }),
};

/**
 * Flex layout utilities
 */
export const flexStyles = {
  row: (gap?: string): CSSProperties => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: gap || '0',
  }),

  column: (gap?: string): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: gap || '0',
  }),

  center: (): CSSProperties => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),

  spaceBetween: (): CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
};

/**
 * Typography styles
 */
export const textStyles = {
  heading: (theme: Theme, level: 1 | 2 | 3 = 1): CSSProperties => {
    const sizes = {
      1: theme.typography.fontSizes.xxl,
      2: theme.typography.fontSizes.xl,
      3: theme.typography.fontSizes.lg,
    };

    return {
      fontSize: sizes[level],
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      margin: 0,
      lineHeight: theme.typography.lineHeights.tight,
    };
  },

  label: (theme: Theme): CSSProperties => ({
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }),

  body: (theme: Theme): CSSProperties => ({
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.normal,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeights.normal,
  }),

  secondary: (theme: Theme): CSSProperties => ({
    ...textStyles.body(theme),
    color: theme.colors.text.secondary,
  }),
};

/**
 * Status badge styles
 */
export const badgeStyles = {
  base: (theme: Theme): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: `2px ${theme.spacing.sm}`,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    borderRadius: theme.borderRadius.full,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }),

  success: (theme: Theme): CSSProperties => ({
    ...badgeStyles.base(theme),
    backgroundColor: theme.colors.status.success + '20',
    color: theme.colors.status.success,
  }),

  error: (theme: Theme): CSSProperties => ({
    ...badgeStyles.base(theme),
    backgroundColor: theme.colors.status.error + '20',
    color: theme.colors.status.error,
  }),

  warning: (theme: Theme): CSSProperties => ({
    ...badgeStyles.base(theme),
    backgroundColor: theme.colors.status.warning + '20',
    color: theme.colors.status.warning,
  }),

  info: (theme: Theme): CSSProperties => ({
    ...badgeStyles.base(theme),
    backgroundColor: theme.colors.status.info + '20',
    color: theme.colors.status.info,
  }),
};

/**
 * Tab styles
 */
export const tabStyles = {
  base: (theme: Theme): CSSProperties => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.secondary,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: theme.transitions.normal,
    outline: 'none',
  }),

  active: (theme: Theme): CSSProperties => ({
    ...tabStyles.base(theme),
    color: theme.colors.interactive.primary,
    fontWeight: theme.typography.fontWeights.semibold,
    borderBottomColor: theme.colors.interactive.primary,
  }),

  hover: (theme: Theme): CSSProperties => ({
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  }),
};
