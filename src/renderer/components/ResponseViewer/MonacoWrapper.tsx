/**
 * MonacoWrapper Component
 *
 * Wraps Monaco Editor for syntax highlighting
 * Provides syntax highlighting for JSON, XML, HTML, and plain text
 *
 * Constitutional requirements:
 * - Performance: Editor loads quickly with optimized settings
 * - Simplicity: Single component for all syntax highlighting needs
 * - Security: Uses local bundled Monaco (no CDN) for CSP compliance
 */

import React from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useThemeStore } from '../../store/themeStore';

// Configure Monaco environment for web workers
self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

// Configure Monaco to use local bundled version (no CDN)
loader.config({ monaco });

export interface MonacoWrapperProps {
  content: string;
  language: 'json' | 'xml' | 'html' | 'plaintext' | 'javascript' | 'typescript';
  height?: string;
  readOnly?: boolean;
}

/**
 * Monaco Editor wrapper for response viewing
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
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);

  // Map theme mode to Monaco theme
  const monacoTheme = mode === 'dark' ? 'vs-dark' : 'vs-light';

  return (
    <Editor
      height={height}
      language={language}
      value={content}
      theme={monacoTheme}
      loading={
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.tertiary,
          }}
        >
          Loading editor...
        </div>
      }
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
  );
}
