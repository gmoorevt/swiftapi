/**
 * AuthSection Component
 *
 * Provides UI for configuring request authentication
 * Supports: None, API Key, Bearer Token, Basic Auth
 */

import React, { useState } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { AuthType } from '../../../types/auth.types';

export function AuthSection(): React.ReactElement {
  const auth = useRequestStore((state) => state.auth);
  const setAuth = useRequestStore((state) => state.actions.setAuth);

  // Local state for form inputs
  const [authType, setAuthType] = useState<AuthType>(auth.type);
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthTypeChange = (newType: AuthType): void => {
    setAuthType(newType);

    // Update store based on type
    switch (newType) {
      case AuthType.NONE:
        setAuth({ type: AuthType.NONE });
        break;
      case AuthType.API_KEY:
        setAuth({
          type: AuthType.API_KEY,
          headerName: apiKeyHeader,
          value: apiKeyValue,
        });
        break;
      case AuthType.BEARER:
        setAuth({
          type: AuthType.BEARER,
          token: bearerToken,
        });
        break;
      case AuthType.BASIC:
        setAuth({
          type: AuthType.BASIC,
          username,
          password,
        });
        break;
    }
  };

  const updateApiKey = (header: string, value: string): void => {
    setApiKeyHeader(header);
    setApiKeyValue(value);
    setAuth({
      type: AuthType.API_KEY,
      headerName: header,
      value,
    });
  };

  const updateBearer = (token: string): void => {
    setBearerToken(token);
    setAuth({
      type: AuthType.BEARER,
      token,
    });
  };

  const updateBasicAuth = (user: string, pass: string): void => {
    setUsername(user);
    setPassword(pass);
    setAuth({
      type: AuthType.BASIC,
      username: user,
      password: pass,
    });
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#555',
        }}
      >
        Authentication
      </label>

      {/* Auth Type Selector */}
      <select
        value={authType}
        onChange={(e) => handleAuthTypeChange(e.target.value as AuthType)}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '13px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          marginBottom: '12px',
        }}
      >
        <option value={AuthType.NONE}>No Auth</option>
        <option value={AuthType.API_KEY}>API Key</option>
        <option value={AuthType.BEARER}>Bearer Token</option>
        <option value={AuthType.BASIC}>Basic Auth</option>
      </select>

      {/* Dynamic Forms Based on Auth Type */}
      {authType === AuthType.API_KEY && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Header Name (e.g., X-API-Key)"
            value={apiKeyHeader}
            onChange={(e) => updateApiKey(e.target.value, apiKeyValue)}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <input
            type="text"
            placeholder="API Key Value"
            value={apiKeyValue}
            onChange={(e) => updateApiKey(apiKeyHeader, e.target.value)}
            style={{
              flex: 2,
              padding: '8px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      )}

      {authType === AuthType.BEARER && (
        <input
          type="text"
          placeholder="Bearer Token"
          value={bearerToken}
          onChange={(e) => updateBearer(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '13px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      )}

      {authType === AuthType.BASIC && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => updateBasicAuth(e.target.value, password)}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => updateBasicAuth(username, e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      )}
    </div>
  );
}
