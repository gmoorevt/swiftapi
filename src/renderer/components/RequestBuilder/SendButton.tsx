/**
 * SendButton Component
 *
 * Button to send the HTTP request
 */

import React from 'react';
import { useRequestStore } from '../../store/requestStore';

export function SendButton(): React.ReactElement {
  const isLoading = useRequestStore((state) => state.isLoading);
  const sendRequest = useRequestStore((state) => state.actions.sendRequest);

  const handleClick = (): void => {
    void sendRequest();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="send-button"
      style={{
        padding: '8px 24px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: isLoading ? '#999' : '#007bff',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      {isLoading ? 'Sending...' : 'Send'}
    </button>
  );
}
