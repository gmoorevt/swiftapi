/**
 * ResponseCookiesViewer Component
 *
 * Displays cookies from Set-Cookie headers in a table format
 * Highlights security attributes (Secure, HttpOnly)
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';
import type { Cookie } from '../../../lib/cookieParser';

export function ResponseCookiesViewer(): React.ReactElement {
  const response = useRequestStore((state) => state.response);

  // Show empty state if no response or no cookies
  if (!response || !response.hasCookies) {
    return (
      <div
        style={{
          padding: '32px',
          color: '#999',
          textAlign: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '48px' }}>🍪</div>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>No cookies to display</div>
        <div style={{ fontSize: '14px', color: '#aaa' }}>
          Cookies will appear here when Set-Cookie headers are present in the response
        </div>
      </div>
    );
  }

  const cookies = response.cookies;

  return (
    <div>
      {/* Cookie count header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
        }}
      >
        {cookies.length} {cookies.length === 1 ? 'cookie' : 'cookies'}
      </div>

      {/* Cookies table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#fafafa',
                borderBottom: '2px solid #e0e0e0',
              }}
            >
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>Value</th>
              <th style={headerCellStyle}>Domain</th>
              <th style={headerCellStyle}>Path</th>
              <th style={headerCellStyle}>Expires</th>
              <th style={headerCellStyle}>Secure</th>
              <th style={headerCellStyle}>HttpOnly</th>
              <th style={headerCellStyle}>SameSite</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((cookie, index) => (
              <CookieRow key={`${cookie.name}-${index}`} cookie={cookie} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CookieRowProps {
  cookie: Cookie;
}

function CookieRow({ cookie }: CookieRowProps): React.ReactElement {
  return (
    <tr
      style={{
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <td style={{ ...cellStyle, fontWeight: 600, color: '#0066cc' }}>{cookie.name}</td>
      <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '13px' }}>
        {cookie.value || '-'}
      </td>
      <td style={cellStyle}>{cookie.domain || '-'}</td>
      <td style={cellStyle}>{cookie.path || '-'}</td>
      <td style={{ ...cellStyle, fontSize: '13px' }}>{cookie.expires || '-'}</td>
      <td style={cellStyle}>
        {cookie.secure ? (
          <span style={{ color: '#28a745', fontWeight: 700, fontSize: '16px' }}>✓</span>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        )}
      </td>
      <td style={cellStyle}>
        {cookie.httpOnly ? (
          <span style={{ color: '#28a745', fontWeight: 700, fontSize: '16px' }}>✓</span>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        )}
      </td>
      <td style={cellStyle}>
        {cookie.sameSite ? (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: getSameSiteColor(cookie.sameSite),
              color: 'white',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {cookie.sameSite}
          </span>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        )}
      </td>
    </tr>
  );
}

const headerCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#555',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  color: '#333',
  verticalAlign: 'middle',
};

function getSameSiteColor(sameSite: string): string {
  const lower = sameSite.toLowerCase();
  switch (lower) {
    case 'strict':
      return '#28a745'; // Green
    case 'lax':
      return '#ffc107'; // Yellow
    case 'none':
      return '#dc3545'; // Red
    default:
      return '#6c757d'; // Gray
  }
}
