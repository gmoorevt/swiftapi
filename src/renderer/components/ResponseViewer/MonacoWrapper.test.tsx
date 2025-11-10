/**
 * MonacoWrapper Component Tests
 *
 * Tests for Monaco Editor integration with lazy loading
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonacoWrapper } from './MonacoWrapper';

// Mock @monaco-editor/react
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, language }: { value: string; language: string }) => (
    <div data-testid="monaco-editor" data-language={language}>
      {value}
    </div>
  ),
}));

describe('MonacoWrapper', () => {
  describe('rendering', () => {
    // T085: MonacoWrapper lazy loads editor component
    it('should render Monaco Editor', () => {
      const content = '{"test": "value"}';

      render(<MonacoWrapper content={content} language="json" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeInTheDocument();
    });

    // T086: MonacoWrapper displays JSON with syntax highlighting
    it('should display JSON content with syntax highlighting', () => {
      const jsonContent = JSON.stringify({ name: 'Test', value: 123 }, null, 2);

      render(<MonacoWrapper content={jsonContent} language="json" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-language', 'json');
      // Check for key content (whitespace may vary in rendering)
      expect(editor.textContent).toContain('"name"');
      expect(editor.textContent).toContain('"Test"');
      expect(editor.textContent).toContain('"value"');
    });

    it('should display XML content with correct language', () => {
      const xmlContent = '<root><item>Test</item></root>';

      render(<MonacoWrapper content={xmlContent} language="xml" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-language', 'xml');
      expect(editor).toHaveTextContent(xmlContent);
    });

    it('should display HTML content with correct language', () => {
      const htmlContent = '<html><body>Test</body></html>';

      render(<MonacoWrapper content={htmlContent} language="html" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-language', 'html');
      expect(editor).toHaveTextContent(htmlContent);
    });

    it('should display plain text with correct language', () => {
      const textContent = 'Plain text response';

      render(<MonacoWrapper content={textContent} language="plaintext" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-language', 'plaintext');
      expect(editor).toHaveTextContent(textContent);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      render(<MonacoWrapper content="" language="json" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveTextContent('');
    });

    it('should handle very large content', () => {
      const largeContent = 'x'.repeat(100000);

      render(<MonacoWrapper content={largeContent} language="plaintext" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeInTheDocument();
    });

    it('should handle content with special characters', () => {
      const content = '{"emoji": "🚀", "unicode": "\\u0048"}';

      render(<MonacoWrapper content={content} language="json" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveTextContent(content);
    });
  });
});
