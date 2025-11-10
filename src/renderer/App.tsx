/**
 * Main Application Component
 * SwiftAPI - A fast, lightweight, and privacy-focused API testing client
 */

import React from 'react';
import { UrlInput } from './components/RequestBuilder/UrlInput';
import { MethodSelector } from './components/RequestBuilder/MethodSelector';
import { BodyEditor } from './components/RequestBuilder/BodyEditor';
import { HeadersEditor } from './components/RequestBuilder/HeadersEditor';
import { SendButton } from './components/RequestBuilder/SendButton';
import { StatusDisplay } from './components/ResponseViewer/StatusDisplay';
import { BodyViewer } from './components/ResponseViewer/BodyViewer';

function App(): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 24px',
          borderBottom: '2px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          SwiftAPI
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '12px',
            color: '#666',
          }}
        >
          Fast, lightweight, privacy-focused API testing
        </p>
      </header>

      {/* Request Builder Section */}
      <section
        style={{
          padding: '24px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'white',
        }}
      >
        <h2
          style={{
            margin: '0 0 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#333',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Request
        </h2>

        {/* URL and Method Row */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ width: '140px' }}>
            <MethodSelector />
          </div>
          <div style={{ flex: 1 }}>
            <UrlInput />
          </div>
          <div style={{ width: '120px' }}>
            <SendButton />
          </div>
        </div>

        {/* Body Editor (shown for POST/PUT/DELETE) */}
        <BodyEditor />

        {/* Headers Editor */}
        <HeadersEditor />
      </section>

      {/* Response Viewer Section */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            padding: '16px 24px 0',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Response
          </h2>
        </div>

        <StatusDisplay />

        <div
          style={{
            flex: 1,
            padding: '24px',
            overflow: 'auto',
          }}
        >
          <BodyViewer />
        </div>
      </section>
    </div>
  );
}

export default App;
