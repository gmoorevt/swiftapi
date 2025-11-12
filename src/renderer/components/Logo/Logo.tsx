/**
 * Logo Component
 *
 * Displays the SwiftAPI logo with theme-aware coloring
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 40, showText = true }: LogoProps): React.ReactElement {
  const { theme } = useTheme();
  const color = theme.colors.interactive.primary;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* SVG Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="95" fill={color} opacity="0.1" />

        {/* Left bracket */}
        <path
          d="M 50 60 L 40 60 L 40 140 L 50 140"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right bracket */}
        <path
          d="M 150 60 L 160 60 L 160 140 L 150 140"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lightning bolt */}
        <path d="M 110 50 L 85 100 L 105 100 L 90 150 L 130 90 L 105 90 Z" fill={color} />

        {/* Inner glow effect */}
        <path
          d="M 110 50 L 85 100 L 105 100 L 90 150 L 130 90 L 105 90 Z"
          fill="white"
          opacity="0.3"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: size * 0.5,
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            SwiftAPI
          </h1>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: size * 0.25,
              color: theme.colors.text.secondary,
            }}
          >
            Fast, lightweight, privacy-focused API testing
          </p>
        </div>
      )}
    </div>
  );
}
