/**
 * MonacoWrapper Component
 *
 * Wraps Monaco Editor with lazy loading for performance
 * Provides syntax highlighting for JSON, XML, HTML, and plain text
 *
 * Constitutional requirements:
 * - Performance: Lazy loading reduces initial bundle size
 * - Simplicity: Single component for all syntax highlighting needs
 */

import React, { Suspense } from 'react';
import Editor from '@monaco-editor/react';

export interface MonacoWrapperProps {
  content: string;
  language: 'json' | 'xml' | 'html' | 'plaintext' | 'javascript' | 'typescript';
  height?: string;
  readOnly?: boolean;
}

/**
 * Monaco Editor wrapper with lazy loading
 *
 * @param content - Content to display in the editor
 * @param language - Language for syntax highlighting
 * @param height - Editor height (default: 400px)
 * @param readOnly - Whether editor is read-only (default: true)
 */
export function MonacoWrapper({
  content,
  language,
  height = '400px',
  readOnly = true,
}: MonacoWrapperProps): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e1e1e',
            color: '#999',
          }}
        >
          Loading editor...
        </div>
      }
    >
      <Editor
        height={height}
        language={language}
        value={content}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
          wordWrap: 'on',
          folding: true,
          automaticLayout: true,
          renderWhitespace: 'selection',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
          },
        }}
      />
    </Suspense>
  );
}
