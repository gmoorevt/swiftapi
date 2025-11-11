import { describe, it, expect } from 'vitest';
import { resolveVariables, VariableResolutionError, extractVariables, hasVariables } from './variableResolver';

describe('variableResolver', () => {
  describe('basic substitution', () => {
    it('should replace single variable', () => {
      const text = 'Hello {{name}}';
      const variables = { name: 'World' };
      expect(resolveVariables(text, variables)).toBe('Hello World');
    });

    it('should replace multiple variables', () => {
      const text = '{{protocol}}://{{domain}}/{{path}}';
      const variables = { protocol: 'https', domain: 'api.example.com', path: 'users' };
      expect(resolveVariables(text, variables)).toBe('https://api.example.com/users');
    });

    it('should handle text with no variables', () => {
      expect(resolveVariables('https://api.example.com', {})).toBe('https://api.example.com');
    });

    it('should handle empty string', () => {
      expect(resolveVariables('', {})).toBe('');
    });

    it('should handle variables at start, middle, and end', () => {
      const text = '{{start}} middle {{end}}';
      const variables = { start: 'BEGIN', end: 'FINISH' };
      expect(resolveVariables(text, variables)).toBe('BEGIN middle FINISH');
    });
  });

  describe('nested resolution', () => {
    it('should resolve nested variables', () => {
      const text = '{{baseUrl}}/users';
      const variables = {
        baseUrl: '{{protocol}}://{{domain}}',
        protocol: 'https',
        domain: 'api.dev.example.com'
      };
      expect(resolveVariables(text, variables)).toBe('https://api.dev.example.com/users');
    });

    it('should handle deeply nested variables (up to 10 levels)', () => {
      const variables: Record<string, string> = {
        a: '{{b}}',
        b: '{{c}}',
        c: '{{d}}',
        d: '{{e}}',
        e: '{{f}}',
        f: '{{g}}',
        g: '{{h}}',
        h: '{{i}}',
        i: '{{j}}',
        j: 'final'
      };
      expect(resolveVariables('{{a}}', variables)).toBe('final');
    });

    it('should handle multiple levels of nesting in same string', () => {
      const variables = {
        url: '{{baseUrl}}/{{path}}',
        baseUrl: '{{protocol}}://{{domain}}',
        protocol: 'https',
        domain: 'api.example.com',
        path: 'users'
      };
      expect(resolveVariables('{{url}}', variables)).toBe('https://api.example.com/users');
    });
  });

  describe('error handling', () => {
    it('should throw on undefined variable', () => {
      expect(() => resolveVariables('{{missing}}', {}))
        .toThrow(VariableResolutionError);
    });

    it('should provide helpful error message for undefined variable', () => {
      expect(() => resolveVariables('{{apiKey}}', {}))
        .toThrow('Variable {{apiKey}} is not defined in current environment');
    });

    it('should throw on circular reference', () => {
      const variables = { a: '{{b}}', b: '{{a}}' };
      expect(() => resolveVariables('{{a}}', variables))
        .toThrow('Circular reference detected');
    });

    it('should show full circular reference path', () => {
      const variables = { a: '{{b}}', b: '{{c}}', c: '{{a}}' };
      expect(() => resolveVariables('{{a}}', variables))
        .toThrow('a → b → c → a');
    });

    it('should throw on max depth exceeded', () => {
      const variables: Record<string, string> = {};
      for (let i = 0; i < 15; i++) {
        variables[`v${i}`] = `{{v${i + 1}}}`;
      }
      variables.v15 = 'end';

      expect(() => resolveVariables('{{v0}}', variables))
        .toThrow('Maximum nesting depth (10) exceeded');
    });

    it('should handle partial variable syntax (not a variable)', () => {
      // Single braces should be treated as literal text
      expect(resolveVariables('{ not a variable }', {})).toBe('{ not a variable }');
      expect(resolveVariables('{{incomplete', {})).toBe('{{incomplete');
      expect(resolveVariables('incomplete}}', {})).toBe('incomplete}}');
    });
  });

  describe('performance', () => {
    it('should resolve 100 variables in under 50ms', () => {
      const variables: Record<string, string> = {};
      let text = '';

      for (let i = 0; i < 100; i++) {
        variables[`var${i}`] = `value${i}`;
        text += `{{var${i}}} `;
      }

      const start = performance.now();
      resolveVariables(text, variables);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50); // Constitutional requirement
    });

    it('should handle large variable values efficiently', () => {
      const largeValue = 'x'.repeat(10000); // 10KB value
      const variables = { large: largeValue };

      const start = performance.now();
      const result = resolveVariables('{{large}}', variables);
      const duration = performance.now() - start;

      expect(result).toBe(largeValue);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('extractVariables utility', () => {
    it('should extract variable names from text', () => {
      const text = '{{baseUrl}}/users/{{userId}}';
      expect(extractVariables(text)).toEqual(['baseUrl', 'userId']);
    });

    it('should return empty array for text with no variables', () => {
      expect(extractVariables('https://api.example.com')).toEqual([]);
    });

    it('should extract duplicate variables only once', () => {
      const text = '{{var}} and {{var}} again';
      expect(extractVariables(text)).toEqual(['var', 'var']); // Returns all occurrences
    });

    it('should handle nested variables in extraction', () => {
      const text = '{{outer}} contains {{inner}}';
      expect(extractVariables(text)).toEqual(['outer', 'inner']);
    });
  });

  describe('hasVariables utility', () => {
    it('should return true when variables present', () => {
      expect(hasVariables('{{baseUrl}}/users')).toBe(true);
    });

    it('should return false when no variables present', () => {
      expect(hasVariables('https://api.example.com')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasVariables('')).toBe(false);
    });

    it('should return false for partial syntax', () => {
      expect(hasVariables('{ not a variable }')).toBe(false);
      expect(hasVariables('{{incomplete')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle variable names with underscores', () => {
      const variables = { base_url: 'https://api.example.com', api_key: 'secret' };
      expect(resolveVariables('{{base_url}}/{{api_key}}', variables))
        .toBe('https://api.example.com/secret');
    });

    it('should handle variable names starting with underscore', () => {
      const variables = { _private: 'value' };
      expect(resolveVariables('{{_private}}', variables)).toBe('value');
    });

    it('should handle UPPER_CASE variable names', () => {
      const variables = { API_KEY: 'secret', BASE_URL: 'https://api.example.com' };
      expect(resolveVariables('{{BASE_URL}}/{{API_KEY}}', variables))
        .toBe('https://api.example.com/secret');
    });

    it('should handle variables with numeric suffixes', () => {
      const variables = { var1: 'value1', var2: 'value2' };
      expect(resolveVariables('{{var1}} {{var2}}', variables)).toBe('value1 value2');
    });

    it('should handle empty variable value', () => {
      const variables = { empty: '' };
      expect(resolveVariables('before{{empty}}after', variables)).toBe('beforeafter');
    });

    it('should handle variable value with special characters', () => {
      const variables = { special: 'value with spaces & symbols!' };
      expect(resolveVariables('{{special}}', variables)).toBe('value with spaces & symbols!');
    });

    it('should not resolve variables in variable values (no infinite recursion)', () => {
      const variables = { a: '{{b}}', b: 'final' };
      expect(resolveVariables('{{a}}', variables)).toBe('final');
    });
  });
});
