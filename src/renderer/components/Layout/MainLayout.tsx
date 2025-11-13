/**
 * Main Layout Component
 *
 * Core layout structure for the application
 */

import React from 'react';
import { mainLayoutStyles } from '../../styles/layouts';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  return <div style={mainLayoutStyles.mainContent()}>{children}</div>;
}
